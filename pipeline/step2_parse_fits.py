"""
STEP 2 — Parse Aditya-L1 SoLEXS + HEL1OS FITS Files
=====================================================
FINAL VERSION — handles ANY number of dates, dropped in at ANY time,
in ANY order, with old dates present or removed. Tested against real
PRADAN data from three real download sessions (June 3, June 10, June 18, 2026).

USAGE — every single time, for the rest of this project:
  1. Download SoLEXS + HEL1OS from PRADAN for whatever date you want.
  2. Drop the unzipped folders into data/raw/aditya_l1/ — don't rename,
     don't flatten, don't delete old dates. Just drop the new folder in.
  3. Run: python pipeline/step2_parse_fits.py
  4. It finds every date automatically, skips dates already processed,
     processes only what's new, and never touches old output files.

That's it. No more code changes needed for new dates.

═══════════════════════════════════════════════════════════════
REAL DATA FORMATS HANDLED (confirmed against actual PRADAN downloads)
═══════════════════════════════════════════════════════════════
SoLEXS:
  Folder : AL1_SLX_L1_YYYYMMDD_v1.0/SDD{1,2}/
  File   : AL1_SOLEXS_YYYYMMDD_SDD{1,2}_L1.lc.gz  (gzipped)
  Data   : Extension 1 "RATE" — columns TIME (unix epoch sec), COUNTS
  Notes  : May have only SDD1, only SDD2, or both. Leading NaN rows
           vary widely (seen 3 rows to 7700+ rows) — always dropna().

HEL1OS:
  Folder : HLS_YYYYMMDD_HHMMSS_NNNNNsec_lev1_V*/.../czt/ + .../cdte/
  Files  : czt/lightcurve_czt{1,2}.fits, cdte/lightcurve_cdte{1,2}.fits
  Data   : Multiple energy-band extensions per file, e.g.
           CZT1_LC_BAND_18.00KEV_TO_160.00KEV with columns
           MJD, ISOT (string timestamp), CTR (count rate), STAT_ERR
  Notes  : Ships in ~12-hour granules — a full day needs 2 granules
           (one starting ~00:00 UTC, one ~12:00 UTC). ISOT must be
           converted to a plain Python list before pd.to_datetime()
           — astropy's chararray breaks pandas otherwise.

Design choice: "hard X-ray channel" = CZT full band (18-160 keV),
"mid X-ray channel" = CdTe full band (1.8-90 keV, cross-check only).
SDD1+SDD2 averaged for SoLEXS; CZT1+CZT2 averaged for CZT; CdTe1+CdTe2
averaged for CdTe — same dual-unit averaging pattern throughout.
"""

import re
import gzip
import shutil
import numpy as np
import pandas as pd
from pathlib import Path
from astropy.io import fits
from loguru import logger

ROOT      = Path(__file__).parent.parent
L1_DIR    = ROOT / "data" / "raw" / "aditya_l1"
PROC_DIR  = ROOT / "data" / "processed"
PROC_DIR.mkdir(parents=True, exist_ok=True)

CZT_FULLBAND_EXT  = "CZT{}_LC_BAND_18.00KEV_TO_160.00KEV"
CDTE_FULLBAND_EXT = "CDTE{}_LC_BAND_1.80KEV_TO_90.00KEV"

# Matches an 8-digit YYYYMMDD date, requiring it start with "20" (year 20xx)
DATE_PATTERN = re.compile(r"(20\d{2})(\d{2})(\d{2})")


# ── Utilities ──────────────────────────────────────────────────────────────

def decompress_gz_files():
    """SoLEXS files arrive as .lc.gz / .pi.gz / .gti.gz — decompress in place, once."""
    gz_files = list(L1_DIR.rglob("*.gz"))
    if not gz_files:
        return
    logger.info(f"Found {len(gz_files)} gzipped file(s) — decompressing...")
    for gz_path in gz_files:
        out_path = gz_path.with_suffix("")
        if out_path.exists():
            continue
        try:
            with gzip.open(gz_path, "rb") as f_in, open(out_path, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
            logger.info(f"  Decompressed: {gz_path.name}")
        except Exception as e:
            logger.error(f"  Failed to decompress {gz_path.name}: {e}")


def inspect_fits(fits_path: Path):
    """Print full structure of any FITS file — use this to debug an unfamiliar format."""
    logger.info(f"\n{'='*60}\nFITS Inspector: {fits_path.name}\n{'='*60}")
    with fits.open(fits_path) as hdul:
        hdul.info()
        for i, hdu in enumerate(hdul):
            logger.info(f"\n--- Extension {i}: {hdu.name} ---")
            if hasattr(hdu, "data") and hdu.data is not None and hasattr(hdu.data, "names"):
                logger.info(f"Columns: {hdu.data.names}  Rows: {len(hdu.data)}")


def extract_date(name: str) -> str:
    """Extract YYYYMMDD from any filename or folder name string. Returns '' if none found."""
    m = DATE_PATTERN.search(name)
    return m.group(0) if m else ""


# ── Discovery: find every distinct date present in the raw folder ──────────

def discover_dates() -> dict:
    """
    Scan data/raw/aditya_l1/ recursively and group every SoLEXS file and
    HEL1OS granule by date (YYYYMMDD), reading the date directly out of
    the actual filename/foldername content — not folder position, not
    file order, not any assumption about what's "new" vs "old".

    Works correctly no matter how many dates are present, what order
    they were added in, or whether unrelated old folders are still there.

    Returns:
      { "20260603": {"solexs": [Path, ...], "hel1os_roots": [Path, ...]},
        "20260618": {...}, ... }
    """
    dates = {}

    for f in list(L1_DIR.rglob("*SOLEXS*.lc")) + list(L1_DIR.rglob("*solexs*.lc")):
        date = extract_date(f.name)
        if not date:
            logger.warning(f"Could not extract date from SoLEXS file: {f.name} — skipping")
            continue
        dates.setdefault(date, {"solexs": [], "hel1os_roots": []})
        if f not in dates[date]["solexs"]:
            dates[date]["solexs"].append(f)

    for czt_dir in L1_DIR.rglob("czt"):
        granule_root = czt_dir.parent
        if not (granule_root / "cdte").exists():
            continue

        date = ""
        for ancestor in [granule_root] + list(granule_root.parents):
            if ancestor == L1_DIR or ancestor == L1_DIR.parent:
                break
            if "HLS" in ancestor.name.upper():
                found = extract_date(ancestor.name)
                if found:
                    date = found
                    break
        if not date:
            date = extract_date(granule_root.name)
        if not date:
            logger.warning(f"Could not extract date from HEL1OS folder: {granule_root} — skipping")
            continue

        dates.setdefault(date, {"solexs": [], "hel1os_roots": []})
        if granule_root not in dates[date]["hel1os_roots"]:
            dates[date]["hel1os_roots"].append(granule_root)

    return dates


# ── SoLEXS parsing ───────────────────────────────────────────────────────

def parse_solexs_lc(fits_path: Path) -> pd.DataFrame:
    """Parse one SoLEXS .lc file → time, soft_counts, soft_flux, detector."""
    logger.info(f"  Parsing SoLEXS: {fits_path.name}")
    try:
        with fits.open(fits_path) as hdul:
            data   = hdul[1].data
            header = hdul[1].header

            if "TIME" not in data.names or "COUNTS" not in data.names:
                logger.error(f"    Unexpected columns: {data.names} — expected TIME, COUNTS")
                return pd.DataFrame()

            df = pd.DataFrame()
            df["time"] = pd.to_datetime(data["TIME"], unit="s", utc=True)
            df["soft_counts"] = data["COUNTS"].astype(float)

            before = len(df)
            df = df.dropna(subset=["soft_counts"])
            dropped = before - len(df)
            if dropped > 0:
                logger.info(f"    Dropped {dropped} NaN rows ({dropped/before*100:.1f}% — instrument warm-up/gaps)")

            sdd = "SDD1" if "SDD1" in fits_path.name else ("SDD2" if "SDD2" in fits_path.name else "unknown")
            df["detector"]  = sdd
            df["soft_flux"] = df["soft_counts"]   # counts/s proxy — no ARF/RMF calibration applied
            df["obs_date"]  = header.get("OBS_DATE", "")

            if len(df) > 0:
                logger.success(f"    {len(df)} rows from {sdd}, mean={df['soft_counts'].mean():.2f} cts/s")
            else:
                logger.warning(f"    {sdd}: 0 valid rows after cleaning")
            return df
    except Exception as e:
        logger.error(f"  SoLEXS parse error on {fits_path.name}: {e}")
        return pd.DataFrame()


def combine_dual_sdd(df: pd.DataFrame) -> pd.DataFrame:
    """Average SDD1 + SDD2 at each timestamp. Handles 1 or 2 detectors present."""
    if df.empty or "detector" not in df.columns:
        return df
    dets = sorted(df["detector"].unique())
    logger.info(f"  SoLEXS detectors present: {dets}")
    if len(dets) <= 1:
        return df.drop(columns=["detector"])
    combined = (df.groupby("time", as_index=False)
                  .agg({"soft_counts": "mean", "soft_flux": "mean", "obs_date": "first"}))
    logger.success(f"  Combined {'+'.join(dets)} → {len(combined)} timestamps")
    return combined


# ── HEL1OS parsing ───────────────────────────────────────────────────────

def parse_hel1os_band(fits_path: Path, ext_name_template: str, detector_num: str,
                       value_col: str) -> pd.DataFrame:
    """Parse one full-band extension from a HEL1OS light curve file."""
    ext_name = ext_name_template.format(detector_num)
    try:
        with fits.open(fits_path) as hdul:
            ext_names = [h.name for h in hdul]
            if ext_name not in ext_names:
                logger.warning(f"    Extension '{ext_name}' not found in {fits_path.name}. "
                               f"Available: {ext_names}")
                return pd.DataFrame()

            data = hdul[ext_name].data
            if "ISOT" not in data.names or "CTR" not in data.names:
                logger.error(f"    Unexpected columns in {ext_name}: {data.names}")
                return pd.DataFrame()

            df = pd.DataFrame()
            # astropy returns FITS string columns as a chararray subclass that
            # pandas.to_datetime cannot ingest directly, even after .astype(str) —
            # must convert to a plain Python list first.
            isot_list = [str(x) for x in data["ISOT"]]
            df["time"] = pd.to_datetime(isot_list, utc=True, format="ISO8601")
            df[value_col] = data["CTR"].astype(float)
            df[f"{value_col}_err"] = data["STAT_ERR"].astype(float)

            before = len(df)
            df = df.dropna(subset=[value_col])
            dropped = before - len(df)
            if dropped > 0:
                logger.info(f"    Dropped {dropped} NaN rows")

            if len(df) > 0:
                logger.success(f"    {fits_path.name} [{ext_name}]: {len(df)} rows, "
                              f"mean={df[value_col].mean():.3f} cts/s")
            return df
    except Exception as e:
        logger.error(f"  HEL1OS parse error on {fits_path.name} [{ext_name}]: {e}")
        return pd.DataFrame()


def parse_hel1os_granule(granule_root: Path) -> pd.DataFrame:
    """Parse ONE HEL1OS granule (one czt/cdte folder pair) → time, hard_counts, mid_counts."""
    czt_dir  = granule_root / "czt"
    cdte_dir = granule_root / "cdte"

    czt_dfs = []
    for n in ["1", "2"]:
        f = czt_dir / f"lightcurve_czt{n}.fits"
        if f.exists():
            d = parse_hel1os_band(f, CZT_FULLBAND_EXT, n, "hard_counts")
            if not d.empty:
                czt_dfs.append(d)
        else:
            logger.warning(f"    Missing expected file: {f.name}")

    czt_combined = (pd.concat(czt_dfs, ignore_index=True).groupby("time", as_index=False)["hard_counts"].mean()
                    if czt_dfs else pd.DataFrame())

    cdte_dfs = []
    for n in ["1", "2"]:
        f = cdte_dir / f"lightcurve_cdte{n}.fits"
        if f.exists():
            d = parse_hel1os_band(f, CDTE_FULLBAND_EXT, n, "mid_counts")
            if not d.empty:
                cdte_dfs.append(d)
        else:
            logger.warning(f"    Missing expected file: {f.name}")

    cdte_combined = (pd.concat(cdte_dfs, ignore_index=True).groupby("time", as_index=False)["mid_counts"].mean()
                     if cdte_dfs else pd.DataFrame())

    if czt_combined.empty and cdte_combined.empty:
        return pd.DataFrame()
    elif czt_combined.empty:
        result = cdte_combined
    elif cdte_combined.empty:
        result = czt_combined
    else:
        result = pd.merge(czt_combined, cdte_combined, on="time", how="outer")

    if "hard_counts" in result.columns:
        result["hard_flux"] = result["hard_counts"]

    result["instrument"] = "HEL1OS"
    return result.sort_values("time").reset_index(drop=True)


def parse_hel1os_all_granules(granule_roots: list) -> pd.DataFrame:
    """Parse and concatenate ALL HEL1OS granules for one date (usually 2, ~12hrs each)."""
    if not granule_roots:
        return pd.DataFrame()

    logger.info(f"  Found {len(granule_roots)} HEL1OS granule(s) for this date:")
    for r in granule_roots:
        logger.info(f"    - {r}")

    granule_dfs = [parse_hel1os_granule(r) for r in granule_roots]
    granule_dfs = [d for d in granule_dfs if not d.empty]
    if not granule_dfs:
        return pd.DataFrame()

    combined = pd.concat(granule_dfs, ignore_index=True)
    before = len(combined)
    combined = combined.drop_duplicates(subset=["time"]).sort_values("time").reset_index(drop=True)
    dupes = before - len(combined)
    logger.success(f"  Combined {len(granule_roots)} granule(s) → {len(combined)} rows"
                  + (f" ({dupes} duplicate timestamps removed)" if dupes else ""))
    return combined


# ── Merge SoLEXS + HEL1OS for ONE date ──────────────────────────────────

def merge_and_sync(solexs_df: pd.DataFrame, hel1os_df: pd.DataFrame,
                    bg_window: int = 300) -> pd.DataFrame:
    """Merge on timestamp, resample to 1-second cadence, background-subtract."""
    if solexs_df.empty and hel1os_df.empty:
        return pd.DataFrame()

    if solexs_df.empty:
        logger.warning("  SoLEXS empty — outputting HEL1OS-only dataset")
        h = hel1os_df.set_index("time").sort_index()
        h = h[~h.index.duplicated(keep="first")]
        return h.reset_index()

    if hel1os_df.empty:
        logger.warning("  HEL1OS empty — outputting SoLEXS-only dataset")
        s = solexs_df.set_index("time").sort_index()
        s = s[~s.index.duplicated(keep="first")]
        return s.reset_index()

    logger.info("  Merging SoLEXS + HEL1OS on timestamp...")
    s = solexs_df.set_index("time").sort_index()
    h = hel1os_df.set_index("time").sort_index()
    s = s[~s.index.duplicated(keep="first")]
    h = h[~h.index.duplicated(keep="first")]

    s = s.resample("1s").mean(numeric_only=True)
    h = h.resample("1s").mean(numeric_only=True)

    merged = s.join(h, how="inner", rsuffix="_hel")

    if "soft_flux" in merged.columns and len(merged) > bg_window:
        bg_soft = merged["soft_flux"].iloc[:bg_window].median()
        merged["soft_flux_bg"] = merged["soft_flux"] - bg_soft
        if "hard_flux" in merged.columns:
            bg_hard = merged["hard_flux"].iloc[:bg_window].median()
            merged["hard_flux_bg"] = merged["hard_flux"] - bg_hard
        logger.info(f"  Background subtracted — soft bg: {bg_soft:.3f} cts/s")
    elif "soft_flux" in merged.columns:
        logger.warning(f"  Fewer than {bg_window} rows — skipping background subtraction")

    merged = merged.reset_index()
    logger.success(f"  Merged: {len(merged)} rows, overlapping time window")
    return merged


# ── Process ONE date end to end ─────────────────────────────────────────

def process_date(date: str, info: dict, force: bool = False) -> Path:
    """
    Parse and merge a single date's SoLEXS + HEL1OS data, save to
    data/processed/aditya_l1_merged_<date>.csv

    Skips if output already exists, unless force=True. This means
    re-running after adding a NEW date only processes the new date.
    """
    out_path = PROC_DIR / f"aditya_l1_merged_{date}.csv"

    if out_path.exists() and not force:
        logger.info(f"\n[{date}] Already processed → {out_path.name} (skipping; delete file to reprocess)")
        return out_path

    logger.info(f"\n[{date}] Processing...")

    solexs_files = info["solexs"]
    hel1os_roots = info["hel1os_roots"]

    solexs_all = pd.DataFrame()
    if solexs_files:
        dfs = [parse_solexs_lc(f) for f in solexs_files]
        dfs = [d for d in dfs if not d.empty]
        if dfs:
            solexs_all = pd.concat(dfs, ignore_index=True)
            solexs_all = combine_dual_sdd(solexs_all)
    else:
        logger.warning(f"[{date}] No SoLEXS files found for this date")

    hel1os_all = parse_hel1os_all_granules(hel1os_roots)
    if hel1os_all.empty and hel1os_roots:
        logger.warning(f"[{date}] HEL1OS folders found but no usable data parsed")
    elif not hel1os_roots:
        logger.warning(f"[{date}] No HEL1OS data found for this date")

    merged = merge_and_sync(solexs_all, hel1os_all)
    if merged.empty:
        logger.error(f"[{date}] No merged output produced — check warnings above")
        return None

    merged.to_csv(out_path, index=False)
    logger.success(f"[{date}] Saved → {out_path.name}  ({len(merged)} rows, {len(merged.columns)} columns)")
    return out_path


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("SolarGuard — Step 2: Parse Aditya-L1 FITS (multi-date, final)")
    logger.info("=" * 60)

    decompress_gz_files()
    dates_found = discover_dates()

    if not dates_found:
        logger.warning("No SoLEXS or HEL1OS data found in data/raw/aditya_l1/")
        logger.info("Place your downloaded PRADAN folders there (any date, any number).")
        logger.info("PRADAN portal: https://pradan.issdc.gov.in")
    else:
        logger.info(f"\nDiscovered {len(dates_found)} distinct date(s):")
        for d, info in sorted(dates_found.items()):
            logger.info(f"  - {d}: {len(info['solexs'])} SoLEXS file(s), "
                        f"{len(info['hel1os_roots'])} HEL1OS granule(s)")

        produced = []
        for date in sorted(dates_found.keys()):
            out = process_date(date, dates_found[date])
            if out:
                produced.append(out)

        logger.info(f"\n{'='*60}")
        if produced:
            logger.success(f"Done. {len(produced)} date(s) ready in data/processed/:")
            for p in produced:
                logger.info(f"  - {p.name}")
        else:
            logger.error("No dates were successfully processed.")

    logger.info("\nNext: python pipeline/step3_feature_engine.py")
