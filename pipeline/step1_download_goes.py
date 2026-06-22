"""
STEP 1 — Download GOES-16 XRS Training Data
============================================
Run this FIRST. No login needed. Downloads automatically.

What it does:
  - Downloads GOES-16 XRS 1-second flux data for key flare events
  - Downloads full GOES flare catalogue (B/C/M/X labeled events)
  - Saves everything to data/raw/goes/

How to run (from solarguard/ folder):
  python pipeline/step1_download_goes.py
"""

import os
import requests
import pandas as pd
from pathlib import Path
from loguru import logger

ROOT     = Path(__file__).parent.parent
GOES_DIR = ROOT / "data" / "raw" / "goes"
GOES_DIR.mkdir(parents=True, exist_ok=True)


# ── Key flare events to download ─────────────────────────────────────────────
EVENTS = [
    ("X6.3_Feb2024", "2024-02-22", "Biggest flare Aditya-L1 has seen — USE FOR DEMO"),
    ("X5.0_Dec2023", "2023-12-31", "X-class near Aditya-L1 launch period"),
    ("M5_Oct2023",   "2023-10-28", "M-class for medium-flare training"),
    ("quiet_Jan2024","2024-01-15", "Quiet day — B-class baseline"),
    ("X1_May2024",   "2024-05-10", "X1 event for training diversity"),
]


def download_noaa_live():
    """Download last 7 days of live GOES XRS data (JSON — no login needed)."""
    logger.info("Downloading NOAA live 7-day XRS data...")
    url = "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json"

    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        df = pd.DataFrame(resp.json())
        df["time_tag"] = pd.to_datetime(df["time_tag"])

        soft = df[df["energy"] == "0.05-0.4nm"]   # soft X-ray channel
        hard = df[df["energy"] == "0.1-0.8nm"]    # hard X-ray channel

        soft.to_csv(GOES_DIR / "live_soft_xray.csv", index=False)
        hard.to_csv(GOES_DIR / "live_hard_xray.csv", index=False)
        logger.success(f"Live data: {len(soft)} soft + {len(hard)} hard rows saved")
    except Exception as e:
        logger.error(f"Live download failed: {e}")


def download_sunpy_event(label, date, notes):
    """Download one day of GOES-16 XRS data using sunpy Fido."""
    save_path = GOES_DIR / f"{label}.csv"
    if save_path.exists():
        logger.info(f"Already exists: {label} — skipping")
        return

    logger.info(f"Downloading {label}  ({notes})")

    try:
        from sunpy.net import Fido, attrs as a
        from sunpy import timeseries as ts

        results = Fido.search(
            a.Time(f"{date} 00:00", f"{date} 23:59"),
            a.Instrument("XRS"),
            a.goes.SatelliteNumber(16),
            a.Resolution("flx1s")           # 1-second cadence
        )

        files  = Fido.fetch(results, path=str(GOES_DIR / "{file}"))
        goes   = ts.TimeSeries(files, concatenate=True)
        df     = goes.to_dataframe()

        # Drop bad quality rows
        for col in ["xrsa_quality", "xrsb_quality"]:
            if col in df.columns:
                df = df[df[col] == 0]

        df.to_csv(save_path)
        logger.success(f"Saved {len(df)} rows → {save_path.name}")

    except ImportError:
        logger.warning("sunpy not installed yet — run: pip install -r requirements.txt")
    except Exception as e:
        logger.error(f"Failed {label}: {e}")


def download_ncei_netcdf(date="20240222"):
    """
    Download GOES-16 science-quality NetCDF directly from NOAA NCEI.
    This is the best quality data for training.
    URL pattern: https://data.ngdc.noaa.gov/platforms/solar-space-observing-satellites/
                 goes/goes16/l2/data/xrsf-l2-flx1s_science/YYYY/MM/
    """
    year, month = date[:4], date[4:6]
    base = (
        "https://data.ngdc.noaa.gov/platforms/solar-space-observing-satellites"
        f"/goes/goes16/l2/data/xrsf-l2-flx1s_science/{year}/{month}/"
    )
    # File naming convention example:
    filename = f"sci_xrsf-l2-flx1s_g16_d{date}_v2-2-0.nc"
    url      = base + filename
    out_path = GOES_DIR / filename

    if out_path.exists():
        logger.info(f"NetCDF already exists: {filename}")
        return out_path

    logger.info(f"Downloading NetCDF: {filename}")
    try:
        resp = requests.get(url, stream=True, timeout=60)
        resp.raise_for_status()
        with open(out_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        logger.success(f"NetCDF saved: {out_path.name}")
        return out_path
    except Exception as e:
        logger.error(f"NetCDF download failed: {e}")
        logger.info(f"Manual URL: {url}")
        return None


if __name__ == "__main__":
    logger.info("=" * 55)
    logger.info("SolarGuard — Step 1: GOES Data Download")
    logger.info("=" * 55)

    # 1. Live data — fastest, works immediately, no install needed
    download_noaa_live()

    # 2. Best quality science NetCDF for the demo X6.3 flare
    download_ncei_netcdf("20240222")

    # 3. Additional training events via sunpy (needs pip install first)
    for label, date, notes in EVENTS:
        download_sunpy_event(label, date, notes)

    logger.success("\nStep 1 done! Files in: data/raw/goes/")
    logger.info("Next: python pipeline/step2_parse_fits.py")
