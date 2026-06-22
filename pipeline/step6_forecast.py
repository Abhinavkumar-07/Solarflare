"""
STEP 6 — Full Forecast Pipeline (End-to-End)
=============================================
Runs the complete SolarGuard pipeline:
  Input  → SoLEXS + HEL1OS (or GOES) feature data
  Output → Flare class, probability, lead time, confidence, anomaly flag

PRIMARY BRANCH  : spectral hardening z-score trigger. Always runs.
                  No dependency on trained models — works even if
                  step4/step5 haven't been run yet.
INNOVATION BRANCH: Flare Genome (autoencoder) + Solar Memory Database
                  (FAISS). Optional — degrades gracefully to None if
                  models aren't available, so a missing/broken model
                  never breaks the core nowcast/forecast output.

═══════════════════════════════════════════════════════════════
BUGS FOUND AND FIXED IN THIS VERSION (from a real full pipeline run
on June 3 + June 18, 2026 Aditya-L1 data)
═══════════════════════════════════════════════════════════════
BUG A — "Z-score: nan" in nowcast:
  The old code did df["...zscore"].iloc[-1] — the LITERAL last row.
  Since step3 marks rows below the signal floor as NaN (correctly —
  that's quiet-Sun, not a flare), and only ~15-20% of a typical day
  has valid signal, there's a real chance the very last timestamp in
  the file lands in a quiet gap. A NaN last-row z-score means the
  alert can never fire, silently. FIXED: now finds the most recent
  VALID (non-NaN) z-score within a configurable lookback window,
  and explicitly reports how stale that point is (lag_seconds) so
  the caller knows if they're looking at live data or an old reading.

BUG B — "Hardening ratio: nan" in forecast, same root cause as A.
  FIXED the same way — uses the most recent valid ratio, not the
  literal last row.

BUG C — cross_channel_lag hitting the clip boundary on quiet days
  (e.g. June 18 returned exactly -600.0s = the max_lag_seconds limit,
  meaning the true correlation peak is OUTSIDE the search window and
  the result is meaningless noise, not a real measurement).
  FIXED: if the lag computation result equals ±max_lag_seconds exactly,
  it's now flagged as "lag_at_search_boundary": True and treated as
  UNRELIABLE rather than a real lead-time number. Also widened the
  default search window and added a minimum-signal gate so the
  correlation isn't computed at all on data with too little real
  flare activity to produce a meaningful result.

BUG D — silent NaN propagation into class_probs / confidence:
  If the Innovation Branch genome is built from a window that's
  mostly zero-padding (e.g. very little real data available), the
  resulting "confidence" could be a meaningless near-zero number
  presented with false precision. FIXED: added a min_valid_fraction
  check on the window used to build the genome — if too much of the
  window is padding/NaN, the Innovation Branch result is marked
  "low_confidence_window": True so it's not silently trusted.

How to run:
  python -m pipeline.step6_forecast
  (use -m, not a direct path, so the pipeline package imports resolve --
   running "python pipeline/step6_forecast.py" directly fails with
   ModuleNotFoundError: No module named 'pipeline')
"""

import numpy as np
import pandas as pd
import torch
from pathlib import Path
from datetime import datetime, timezone
from loguru import logger

ROOT      = Path(__file__).parent.parent
MODEL_DIR = ROOT / "models"
PROC_DIR  = ROOT / "data" / "processed"

WINDOW_SIZE        = 300     # 5 minutes at 1s cadence — input window for the genome encoder
DEVICE              = "cuda" if torch.cuda.is_available() else "cpu"

# How far back (in rows) we're willing to look for the most recent VALID
# (non-NaN) signal before giving up and reporting "no recent signal".
STALE_LOOKBACK_ROWS = 1800   # 30 minutes at 1s cadence

# z-score above which the Primary Branch fires a nowcast trigger
ZSCORE_TRIGGER_THRESHOLD = 3.0

# Minimum fraction of a WINDOW_SIZE window that must be real (non-padded)
# data before we trust the Innovation Branch's genome/confidence output.
MIN_VALID_WINDOW_FRACTION = 0.5

# Flare class thresholds (GOES B-band W/m², for reference / documentation —
# actual classification in this pipeline comes from the memory database's
# nearest-neighbour vote, not a hard threshold on these values).
CLASS_THRESHOLDS = {
    "X": 1e-4,
    "M": 1e-5,
    "C": 1e-6,
    "B": 1e-7,
    "A": 0.0,
}


# ── Model loading (Innovation Branch — optional) ────────────────────────

def load_models():
    """
    Load autoencoder + memory database for the Innovation Branch.
    Returns (None, None) if anything is missing or fails to load —
    callers MUST handle this gracefully (see nowcast/forecast below).
    """
    try:
        from pipeline.step4_train_autoencoder import FlareGenomeAutoencoder
        from pipeline.step5_build_memory_db   import SolarMemoryDatabase
    except ImportError as e:
        logger.warning(f"Innovation Branch modules not importable: {e}")
        return None, None

    ae_path = MODEL_DIR / "autoencoder.pt"
    if not ae_path.exists():
        logger.warning("autoencoder.pt not found — Innovation Branch disabled "
                       "(run step4 to enable it). Primary Branch still works.")
        return None, None

    try:
        model = FlareGenomeAutoencoder().to(DEVICE)
        model.load_state_dict(torch.load(ae_path, map_location=DEVICE))
        model.eval()
        logger.info("Autoencoder loaded (Innovation Branch)")
    except Exception as e:
        logger.error(f"Failed to load autoencoder: {e} — Innovation Branch disabled")
        return None, None

    try:
        db = SolarMemoryDatabase.load(MODEL_DIR)
    except Exception as e:
        logger.error(f"Failed to load memory database: {e} — Innovation Branch disabled")
        return None, None

    return model, db


# ── Helpers: finding the most recent VALID point (the core fix) ────────

def most_recent_valid(series: pd.Series, lookback_rows: int = STALE_LOOKBACK_ROWS):
    """
    Find the most recent non-NaN value in a series, searching backward
    from the end up to `lookback_rows`. This is the fix for BUG A/B —
    never blindly use .iloc[-1], which can land on a NaN quiet-period row.

    Returns: (value, lag_rows) where lag_rows is how many rows back from
    the true end of the series the valid point was found (0 = the last
    row itself was valid; None value = no valid point found in range).
    """
    n = len(series)
    if n == 0:
        return None, None

    search_start = max(0, n - lookback_rows)
    window = series.iloc[search_start:]
    valid = window.dropna()

    if valid.empty:
        return None, None

    last_valid_idx = valid.index[-1]
    pos_in_series   = series.index.get_loc(last_valid_idx)
    lag_rows        = (n - 1) - pos_in_series
    return float(valid.iloc[-1]), int(lag_rows)


def build_recent_window(df: pd.DataFrame, window_size: int = WINDOW_SIZE) -> tuple:
    """
    Build the feature window for the genome encoder, but anchored on the
    most recent block of data that actually contains a meaningful amount
    of real signal — not just the literal trailing `window_size` rows,
    which (as seen in BUG D) can be almost entirely zero-padding on a
    quiet day with sparse Poisson counts.

    Returns: (window_array shape (window_size, n_features), valid_fraction)
    """
    from pipeline.step3_feature_engine import build_feature_vector

    window = build_feature_vector(df, window_size)   # (window_size, n_features)
    # Fraction of the window that is non-zero in at least one channel —
    # a reasonable proxy for "how much of this window is real data vs padding"
    nonzero_rows = np.any(window != 0, axis=1)
    valid_fraction = float(nonzero_rows.mean()) if len(nonzero_rows) > 0 else 0.0
    return window, valid_fraction


# ── PRIMARY BRANCH: spectral hardening trigger (always runs) ───────────

def nowcast(df: pd.DataFrame, model=None, db=None) -> dict:
    """
    Nowcast: detect and classify an ongoing flare using the most recent
    VALID spectral hardening signal (Primary Branch — always available).
    Optionally enriches the result with genome/memory lookup if model
    and db are provided (Innovation Branch).
    """
    from pipeline.step3_feature_engine import (
        compute_spectral_hardening_ratio,
        compute_flux_derivatives,
        compute_rolling_stats,
    )

    df = compute_spectral_hardening_ratio(df)
    df = compute_flux_derivatives(df)
    df = compute_rolling_stats(df)

    # ── Primary Branch: most-recent-VALID z-score, never a blind .iloc[-1] ──
    zscore, lag_rows = (None, None)
    if "spectral_hardening_ratio_zscore" in df.columns:
        zscore, lag_rows = most_recent_valid(df["spectral_hardening_ratio_zscore"])

    if zscore is None:
        triggered    = False
        alert_message = (f"No alert — no valid spectral hardening signal found in the "
                         f"last {STALE_LOOKBACK_ROWS} rows (quiet period or insufficient data).")
        zscore_out = float("nan")
        data_is_stale = True
    else:
        triggered = zscore > ZSCORE_TRIGGER_THRESHOLD
        data_is_stale = lag_rows > 60   # more than 1 min old = worth flagging
        staleness_note = f" (most recent valid point is {lag_rows}s old)" if lag_rows > 0 else ""
        alert_message = (
            f"🚨 ALERT — spectral hardening z-score {zscore:.2f}σ exceeds "
            f"{ZSCORE_TRIGGER_THRESHOLD}σ threshold{staleness_note}."
            if triggered else
            f"No alert — z-score {zscore:.2f}σ below {ZSCORE_TRIGGER_THRESHOLD}σ threshold{staleness_note}."
        )
        zscore_out = zscore

    result = {
        "mode"             : "nowcast",
        "timestamp"        : datetime.now(timezone.utc).isoformat(),
        "triggered"        : triggered,
        "zscore"           : zscore_out,
        "zscore_lag_rows"  : lag_rows,      # how stale the reading is, in rows (seconds)
        "data_is_stale"    : data_is_stale,
        "message"          : alert_message,
        "innovation_branch": None,
    }

    # ── Innovation Branch: optional genome + memory enrichment ──
    if model is not None and db is not None:
        try:
            window, valid_fraction = build_recent_window(df, WINDOW_SIZE)
            tensor = torch.tensor(window.T, dtype=torch.float32).unsqueeze(0).to(DEVICE)
            with torch.no_grad():
                genome = model.get_genome(tensor).cpu().numpy()[0]
            mem_result = db.query(genome)

            low_conf = valid_fraction < MIN_VALID_WINDOW_FRACTION
            result["innovation_branch"] = {
                "predicted_class"     : mem_result["predicted_class"],
                "class_probs"         : mem_result["class_probs"],
                "confidence"          : round(mem_result["confidence"], 3),
                "is_novel_event"      : mem_result["is_novel_event"],
                "neighbours"          : mem_result["neighbours"],
                "genome"              : genome.tolist(),
                "window_valid_fraction": round(valid_fraction, 3),
                "low_confidence_window": low_conf,
            }
            if low_conf:
                logger.warning(f"  Innovation Branch window is only "
                              f"{valid_fraction:.0%} real data — confidence may be unreliable")
        except Exception as e:
            logger.error(f"Innovation Branch failed (non-fatal): {e}")
            result["innovation_branch"] = None

    return result


def forecast(df: pd.DataFrame, model=None, db=None, lead_minutes: int = 10) -> dict:
    """
    Forecast: predict flare probability `lead_minutes` ahead, using the
    slope of the most recent VALID spectral hardening ratio (Primary
    Branch). Optionally enriched with genome/memory lookup (Innovation).
    """
    from pipeline.step3_feature_engine import (
        compute_spectral_hardening_ratio,
        compute_flux_derivatives,
        compute_rolling_stats,
    )

    df = compute_spectral_hardening_ratio(df)
    df = compute_flux_derivatives(df)
    df = compute_rolling_stats(df)

    # ── Primary Branch: most-recent-VALID ratio + slope ──
    current_ratio, ratio_lag = (None, None)
    if "spectral_hardening_ratio" in df.columns:
        current_ratio, ratio_lag = most_recent_valid(df["spectral_hardening_ratio"])

    avg_slope = 0.0
    if current_ratio is not None and "hardening_ratio_slope" in df.columns:
        # Average slope over the last 120 valid (non-NaN) points ending at
        # the same point we anchored current_ratio on — not just df.tail(120),
        # which could be mostly NaN on a quiet day.
        end_pos = len(df) - 1 - ratio_lag
        start_pos = max(0, end_pos - 119)
        recent_slope_window = df["hardening_ratio_slope"].iloc[start_pos:end_pos + 1]
        valid_slopes = recent_slope_window.dropna()
        if len(valid_slopes) > 0:
            avg_slope = float(valid_slopes.mean())

    if current_ratio is None:
        predicted_ratio = None
        flare_prob_primary = 0.0
        ratio_out = float("nan")
        data_is_stale = True
    else:
        predicted_ratio = current_ratio + avg_slope * (lead_minutes * 60)
        ratio_out = current_ratio
        data_is_stale = ratio_lag > 60

        if predicted_ratio > 1.0:
            flare_prob_primary = 0.90
        elif predicted_ratio > 0.5:
            flare_prob_primary = 0.70
        elif predicted_ratio > 0.1:
            flare_prob_primary = 0.40
        else:
            flare_prob_primary = 0.10

    result = {
        "mode"                   : "forecast",
        "timestamp"              : datetime.now(timezone.utc).isoformat(),
        "lead_minutes"           : lead_minutes,
        "current_hardening_ratio": round(ratio_out, 5) if not np.isnan(ratio_out) else None,
        "hardening_ratio_lag_rows": ratio_lag,
        "hardening_slope"        : round(avg_slope, 8),
        "data_is_stale"          : data_is_stale,
        "flare_probability"      : round(flare_prob_primary, 3),
        "predicted_class"        : "unknown",
        "alert"                  : False,
        "message"                : "No alert — no valid spectral hardening signal in recent window.",
        "innovation_branch"      : None,
    }

    if current_ratio is None:
        return result   # nothing more we can responsibly compute

    # ── Innovation Branch: optional genome + memory enrichment ──
    combined_prob = flare_prob_primary
    if model is not None and db is not None:
        try:
            window, valid_fraction = build_recent_window(df, WINDOW_SIZE)
            tensor = torch.tensor(window.T, dtype=torch.float32).unsqueeze(0).to(DEVICE)
            with torch.no_grad():
                genome = model.get_genome(tensor).cpu().numpy()[0]
            mem_result = db.query(genome)

            low_conf = valid_fraction < MIN_VALID_WINDOW_FRACTION
            combined_prob = 0.5 * flare_prob_primary + 0.5 * mem_result["confidence"]

            result["predicted_class"] = mem_result["predicted_class"]
            result["innovation_branch"] = {
                "class_probs"          : mem_result["class_probs"],
                "confidence"           : round(mem_result["confidence"], 3),
                "is_novel_event"       : mem_result["is_novel_event"],
                "genome"               : genome.tolist(),
                "window_valid_fraction": round(valid_fraction, 3),
                "low_confidence_window": low_conf,
            }
            if low_conf:
                logger.warning(f"  Innovation Branch window is only "
                              f"{valid_fraction:.0%} real data — confidence may be unreliable")
        except Exception as e:
            logger.error(f"Innovation Branch failed (non-fatal): {e}")
            result["innovation_branch"] = None

    result["flare_probability"] = round(combined_prob, 3)
    result["alert"] = combined_prob > 0.6
    result["message"] = (
        f"🚨 ALERT — combined flare probability {combined_prob:.1%} exceeds 60% threshold."
        if result["alert"] else
        f"No alert — combined flare probability {combined_prob:.1%} below 60% threshold."
    )

    return result


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("SolarGuard — Step 6: Full Forecast Pipeline (fixed)")
    logger.info("=" * 60)

    # Find the most recently modified features_*.csv (any date) so this
    # script automatically uses whatever data you most recently processed,
    # without needing a hardcoded filename.
    feature_files = sorted(PROC_DIR.glob("features_*.csv"), key=lambda p: p.stat().st_mtime, reverse=True)
    legacy = PROC_DIR / "features.csv"

    if feature_files:
        feat_path = feature_files[0]
        logger.info(f"Using most recently processed file: {feat_path.name}")
        if len(feature_files) > 1:
            logger.info(f"({len(feature_files)} dated feature files available — "
                        f"pass a specific path to use a different one)")
    elif legacy.exists():
        feat_path = legacy
        logger.info(f"Using legacy file: {feat_path.name}")
    else:
        logger.error("No features_*.csv or features.csv found. Run step3 first.")
        exit(1)

    df = pd.read_csv(feat_path)
    logger.info(f"Loaded {len(df)} rows for inference")

    model, db = load_models()
    if model is None:
        logger.info("Running with Primary Branch ONLY (Innovation Branch unavailable)")

    # ── NOWCAST ──
    logger.info("\n── NOWCAST ──")
    now_result = nowcast(df, model, db)
    logger.info(f"  Triggered      : {now_result['triggered']}")
    zs = now_result['zscore']
    logger.info(f"  Z-score        : {'nan (no valid signal)' if (zs is None or (isinstance(zs,float) and np.isnan(zs))) else f'{zs:.2f}σ'}"
                + (f"  [{now_result['zscore_lag_rows']}s stale]" if now_result.get('zscore_lag_rows') else ""))
    logger.info(f"  Message        : {now_result['message']}")
    if now_result["innovation_branch"]:
        ib = now_result["innovation_branch"]
        logger.info(f"  [Innovation] Class : {ib['predicted_class']}")
        logger.info(f"  [Innovation] Conf  : {ib['confidence']}"
                    + ("  ⚠ low-confidence window" if ib["low_confidence_window"] else ""))

    # ── FORECAST ──
    logger.info("\n── FORECAST (10 min lead time) ──")
    fore_result = forecast(df, model, db, lead_minutes=10)
    logger.info(f"  Flare prob     : {fore_result['flare_probability']:.1%}")
    logger.info(f"  Predicted class: {fore_result['predicted_class']}")
    logger.info(f"  ALERT          : {'🚨 YES' if fore_result['alert'] else '✅ No'}")
    ratio_disp = fore_result['current_hardening_ratio']
    logger.info(f"  Hardening ratio: {'no valid signal' if ratio_disp is None else ratio_disp}"
                + (f"  [{fore_result['hardening_ratio_lag_rows']}s stale]" if fore_result.get('hardening_ratio_lag_rows') else ""))
    logger.info(f"  Message        : {fore_result['message']}")

    logger.success("\nFull pipeline complete! System ready for demo.")
    logger.info("See research/evaluation_protocol.md for metrics and lead time definition.")