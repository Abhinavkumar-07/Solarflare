"""
STEP 3 — Spectral Hardening Feature Engine
=============================================
FINAL VERSION — handles ANY number of dates, dropped in at ANY time.
Mirrors step2's date-discovery pattern so the two scripts never drift
apart again. Tested against real PRADAN data (June 3 + June 18, 2026).

THE CORE INSIGHT this step computes:
  Before a flare peaks, hard X-rays (HEL1OS) rise FASTER than soft
  X-rays (SoLEXS). The ratio HEL1OS/SoLEXS climbing steeply is an
  early-warning precursor signal. Confirmed on real June 3, 2026 data:
  hard X-ray peaked 2.7 to 6.0 minutes BEFORE soft X-ray, on all three
  flares that day (M9.3, M7.7, X1.0).

USAGE — every single time, for the rest of this project:
  1. Run step2_parse_fits.py first (produces aditya_l1_merged_<date>.csv
     files in data/processed/).
  2. Run this script: python pipeline/step3_feature_engine.py
  3. It finds every dated merged file automatically, skips dates already
     processed, and produces features_<date>.csv for each one.

That's it. No more code changes needed for new dates.

═══════════════════════════════════════════════════════════════
TWO BUGS FOUND AND FIXED IN THIS VERSION (verified against real data)
═══════════════════════════════════════════════════════════════
BUG 1 — divide-by-zero / absurd ratios:
  The ratio MUST be computed from raw counts (always >= 0), not from
  background-subtracted flux (*_bg columns), because *_bg is legitimately
  NEGATIVE during quiet periods (flux - baseline_median dips below zero
  from Poisson noise). Clipping a negative value up to a tiny epsilon
  creates a near-zero denominator — we saw this produce a ratio of
  2.25 TRILLION on real data before this fix. Fixed by using raw counts
  with a real signal floor (1 count/s) instead of an arbitrary epsilon;
  below-floor timesteps get a clean NaN instead of a fake spike.

BUG 2 — cross-channel lag sign was backwards:
  scipy.signal.correlate(soft, hard) returns a POSITIVE lag when hard
  leads soft — the original code's comment and interpretation had this
  backwards. Verified with a synthetic test (hard placed 150s before
  soft) and confirmed against real June 3 data (matches the independently
  computed per-flare lead times of 2.7-6.0 minutes). Fixed: positive
  lag = hard leads soft = expected flare precursor signature.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from scipy.signal import correlate
from loguru import logger

ROOT     = Path(__file__).parent.parent
PROC_DIR = ROOT / "data" / "processed"
GOES_DIR = ROOT / "data" / "raw" / "goes"


# ── Feature computation functions ───────────────────────────────────────

def compute_spectral_hardening_ratio(df: pd.DataFrame,
                                      min_signal_floor: float = 1.0) -> pd.DataFrame:
    """
    THE CORE INSIGHT: Hard X-ray / Soft X-ray ratio.

    Uses raw counts (hard_counts, soft_counts) — never background-
    subtracted flux — because *_bg columns can be legitimately negative
    and that breaks the ratio (see module docstring, BUG 1).

    Timesteps where either channel is below min_signal_floor (default
    1 count/s) are marked NaN rather than producing a fake huge ratio
    from near-zero denominators.
    """
    if "hard_counts" in df.columns and "soft_counts" in df.columns:
        hard = df["hard_counts"]
        soft = df["soft_counts"]
    elif "hard_flux" in df.columns and "soft_flux" in df.columns:
        hard = df["hard_flux"]
        soft = df["soft_flux"]
    else:
        logger.warning("  Flux/count columns not found — skipping hardening ratio")
        return df

    valid = (hard >= min_signal_floor) & (soft >= min_signal_floor)

    ratio = pd.Series(np.nan, index=df.index)
    ratio[valid] = hard[valid] / soft[valid]

    df["spectral_hardening_ratio"] = ratio
    df["log_hardening_ratio"]      = np.log10(ratio.clip(lower=1e-6))
    df["hardening_ratio_slope"]    = df["spectral_hardening_ratio"].diff()

    n_valid = int(valid.sum())
    if n_valid > 0:
        logger.info(f"  Spectral hardening ratio: {n_valid}/{len(df)} rows valid "
                    f"({n_valid/len(df)*100:.1f}%). Range: "
                    f"{df['spectral_hardening_ratio'].min():.4f} to "
                    f"{df['spectral_hardening_ratio'].max():.4f}")
    else:
        logger.warning("  No rows had signal above the floor on both channels")
    return df


def compute_flux_derivatives(df: pd.DataFrame) -> pd.DataFrame:
    """First and second derivative of flux on both channels."""
    if "soft_flux" in df.columns:
        df["soft_flux_slope"] = df["soft_flux"].diff()
        df["soft_flux_accel"] = df["soft_flux_slope"].diff()
    if "hard_flux" in df.columns:
        df["hard_flux_slope"] = df["hard_flux"].diff()
        df["hard_flux_accel"] = df["hard_flux_slope"].diff()
    logger.info("  Flux derivatives computed")
    return df


def compute_rolling_stats(df: pd.DataFrame) -> pd.DataFrame:
    """Rolling mean/std at 30s and 5min windows, plus z-score vs 5min baseline."""
    for col in ["soft_flux", "hard_flux", "spectral_hardening_ratio"]:
        if col not in df.columns:
            continue
        df[f"{col}_roll30s_mean"] = df[col].rolling(30,  min_periods=5).mean()
        df[f"{col}_roll30s_std"]  = df[col].rolling(30,  min_periods=5).std()
        df[f"{col}_roll5m_mean"]  = df[col].rolling(300, min_periods=30).mean()
        df[f"{col}_roll5m_std"]   = df[col].rolling(300, min_periods=30).std()
        df[f"{col}_zscore"] = (
            (df[col] - df[f"{col}_roll5m_mean"]) / (df[f"{col}_roll5m_std"] + 1e-30)
        )
    logger.info("  Rolling statistics computed (30s + 5min windows)")
    return df


def compute_cross_channel_lag(soft_series: pd.Series,
                               hard_series: pd.Series,
                               max_lag_seconds: int = 600) -> float:
    """
    Time lag between hard and soft X-ray channels, in seconds.

    POSITIVE result = hard X-ray peaked BEFORE soft X-ray (expected
    flare precursor signature). Sign convention verified against real
    June 3, 2026 data — see module docstring BUG 2.

    RELIABILITY NOTE (found via real June 18, 2026 quiet-day data):
    On a quiet day with little real flare signal, this function can
    return exactly ±max_lag_seconds — meaning the true correlation
    peak lies OUTSIDE the search window and the result is essentially
    noise, not a real measurement. Confirmed by reproducing this exact
    symptom on pure random Poisson noise. Callers should treat a
    returned value that exactly equals ±max_lag_seconds as UNRELIABLE.
    Use compute_cross_channel_lag_safe() below for an automatically
    flagged version.
    """
    s = soft_series.fillna(0).values
    h = hard_series.fillna(0).values

    if len(s) < 2 or len(h) < 2:
        return 0.0

    s = (s - s.mean()) / (s.std() + 1e-30)
    h = (h - h.mean()) / (h.std() + 1e-30)

    correlation = correlate(s, h, mode="full")
    lags        = np.arange(-len(s) + 1, len(h))
    best_lag    = lags[np.argmax(correlation)]
    best_lag    = np.clip(best_lag, -max_lag_seconds, max_lag_seconds)
    return float(best_lag)


def compute_cross_channel_lag_safe(soft_series: pd.Series,
                                    hard_series: pd.Series,
                                    max_lag_seconds: int = 600) -> dict:
    """
    Same as compute_cross_channel_lag(), but returns a dict that
    explicitly flags whether the result hit the search-window boundary
    (and is therefore unreliable) instead of silently returning a
    number that looks valid but isn't.

    Returns:
      {"lag_seconds": float, "at_boundary": bool, "reliable": bool}
    """
    lag = compute_cross_channel_lag(soft_series, hard_series, max_lag_seconds)
    at_boundary = abs(lag) >= max_lag_seconds
    return {
        "lag_seconds": lag,
        "at_boundary": at_boundary,
        "reliable": not at_boundary,
    }


def build_feature_vector(df: pd.DataFrame, window_size: int = 300) -> np.ndarray:
    """
    Build a fixed-size feature vector from the LAST window_size rows.
    Input to the Flare Genome Generator (autoencoder) in step4.
    Returns shape (window_size, n_features).
    """
    feature_cols = [
        "soft_flux", "hard_flux",
        "spectral_hardening_ratio", "log_hardening_ratio",
        "soft_flux_slope", "hard_flux_slope",
        "spectral_hardening_ratio_roll30s_std",
        "spectral_hardening_ratio_zscore",
    ]
    available = [c for c in feature_cols if c in df.columns]
    arr = df[available].fillna(0).values

    if len(arr) < window_size:
        pad = np.zeros((window_size - len(arr), arr.shape[1]))
        arr = np.vstack([pad, arr])
    else:
        arr = arr[-window_size:]

    return arr.astype(np.float32)


def run_on_goes_csv(csv_path: Path) -> pd.DataFrame:
    """Adapt a GOES CSV (from step1) to the same column naming used for Aditya-L1."""
    df = pd.read_csv(csv_path, index_col=0, parse_dates=True)
    df = df.reset_index().rename(columns={"index": "time"})
    if "xrsa" in df.columns:
        df["soft_flux"] = df["xrsa"]
    if "xrsb" in df.columns:
        df["hard_flux"] = df["xrsb"]
    return df


# ── Discovery: find every per-date merged file from step2 ──────────────

def discover_merged_files() -> list:
    """
    Find every per-date Aditya-L1 merged file produced by step2:
      data/processed/aditya_l1_merged_<YYYYMMDD>.csv

    Also supports a legacy single-file fallback (aditya_l1_merged.csv,
    no date suffix) in case step2 ever produces that instead.

    Returns a sorted list of (date_label, Path) tuples — works for
    ANY number of dates, found automatically, every time this runs.
    """
    dated_files = sorted(PROC_DIR.glob("aditya_l1_merged_*.csv"))
    if dated_files:
        return [(f.stem.replace("aditya_l1_merged_", ""), f) for f in dated_files]

    legacy = PROC_DIR / "aditya_l1_merged.csv"
    if legacy.exists():
        return [("legacy", legacy)]

    return []


# ── Process ONE date's features end to end ──────────────────────────────

def process_one_file(date_label: str, csv_path: Path, force: bool = False) -> Path:
    """
    Run full feature engineering on ONE date's merged CSV.
    Saves to data/processed/features_<date_label>.csv

    Skips if already processed, unless force=True — mirrors step2's
    process_date() so adding a new date only reprocesses what's new.
    """
    out_path = PROC_DIR / f"features_{date_label}.csv"

    if out_path.exists() and not force:
        logger.info(f"\n[{date_label}] Already processed → {out_path.name} (skipping; delete to reprocess)")
        return out_path

    logger.info(f"\n[{date_label}] Processing {csv_path.name}...")
    df = pd.read_csv(csv_path, parse_dates=["time"])
    logger.info(f"  Loaded {len(df)} rows")

    if len(df) == 0:
        logger.warning(f"[{date_label}] Empty file — skipping")
        return None

    df = compute_spectral_hardening_ratio(df)
    df = compute_flux_derivatives(df)
    df = compute_rolling_stats(df)

    if "soft_flux" in df.columns and "hard_flux" in df.columns:
        lag_result = compute_cross_channel_lag_safe(df["soft_flux"], df["hard_flux"])
        lag = lag_result["lag_seconds"]
        if lag_result["at_boundary"]:
            logger.warning(f"  Cross-channel lag: {lag:+.1f}s — HIT SEARCH BOUNDARY, "
                          f"UNRELIABLE (likely a quiet day with no real correlation signal)")
        else:
            direction = ("hard leads soft (expected precursor)" if lag > 0
                         else "hard lags soft" if lag < 0 else "simultaneous")
            logger.info(f"  Cross-channel lag: {lag:+.1f}s ({direction})")
        df["cross_channel_lag"] = lag
        df["cross_channel_lag_reliable"] = lag_result["reliable"]

    df["date_label"] = date_label

    df.to_csv(out_path, index=False)
    logger.success(f"[{date_label}] Features saved → {out_path.name}")
    return out_path


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("SolarGuard — Step 3: Feature Engineering (multi-date, final)")
    logger.info("=" * 60)

    merged_files = discover_merged_files()
    goes_files   = list(GOES_DIR.glob("*.csv")) if GOES_DIR.exists() else []

    if merged_files:
        logger.info(f"\nDiscovered {len(merged_files)} Aditya-L1 merged file(s):")
        for label, path in merged_files:
            logger.info(f"  - {label}: {path.name}")

        produced = []
        for label, path in merged_files:
            out = process_one_file(label, path)
            if out:
                produced.append(out)

        logger.info(f"\n{'='*60}")
        if produced:
            logger.success(f"Done. {len(produced)} date(s) of features ready in data/processed/:")
            for p in produced:
                logger.info(f"  - {p.name}")
        else:
            logger.error("No dates were successfully processed.")

    elif goes_files:
        first_goes = sorted(goes_files)[0]
        logger.info(f"No Aditya-L1 data found. Using GOES data for development: {first_goes.name}")
        df = run_on_goes_csv(first_goes)
        logger.info(f"Loaded {len(df)} rows from {first_goes.name}")

        df = compute_spectral_hardening_ratio(df)
        df = compute_flux_derivatives(df)
        df = compute_rolling_stats(df)

        if "soft_flux" in df.columns and "hard_flux" in df.columns:
            lag = compute_cross_channel_lag(df["soft_flux"], df["hard_flux"])
            logger.info(f"Cross-channel lag: {lag:+.1f}s")
            df["cross_channel_lag"] = lag

        out = PROC_DIR / "features_goes_dev.csv"
        df.to_csv(out, index=False)
        logger.success(f"Features saved → {out}")

    else:
        logger.error("No data found. Run step2 (Aditya-L1) or step1 (GOES) first.")
        exit(1)

    logger.info("\nNext: python pipeline/step4_train_autoencoder.py")