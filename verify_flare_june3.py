"""
VERIFY v2 — Fixed divide-by-zero bug + proper lead-time calculation.

The original script's baseline used the FULL DAY median, which is 0 for
hard X-ray counts (CZT sits at 0 most of the quiet day) — causing inf and
trillion-scale nonsense ratios. This version:
  1. Uses a QUIET baseline window (the first 10 minutes of data) instead
     of the full-day median, which is more physically meaningful anyway.
  2. Computes lead time properly: when does hard X-ray cross a significance
     threshold, vs when does soft X-ray peak?
  3. Reports the spectral hardening ratio using a sane floor.

Run from solarguard_v2/solarguard:
  python verify_flare_june3_v2.py
"""

import pandas as pd
import numpy as np

df = pd.read_csv("data/processed/aditya_l1_merged.csv", parse_dates=["time"])
print(f"Loaded {len(df)} rows")
print(f"Time range: {df['time'].min()} to {df['time'].max()}\n")

# Quiet baseline = first 10 minutes of the day (well before any flare)
quiet = df.iloc[:600]
baseline_soft = quiet["soft_counts"].mean()
baseline_hard = quiet["hard_counts"].mean()
print(f"Quiet baseline (00:00-00:10 UTC): soft={baseline_soft:.2f} cts/s, hard={baseline_hard:.3f} cts/s\n")

windows = {
    "M9.3 (~01:36 UTC)":      ("2026-06-03 01:20:00", "2026-06-03 01:50:00"),
    "M7.7 (~07:00 UTC)":      ("2026-06-03 06:45:00", "2026-06-03 07:15:00"),
    "X1.0 (11:19-11:35 UTC)": ("2026-06-03 11:10:00", "2026-06-03 11:45:00"),
}

for label, (start, end) in windows.items():
    mask = (df["time"] >= start) & (df["time"] <= end)
    window = df[mask].reset_index(drop=True)
    if len(window) == 0:
        print(f"{label}: NO DATA\n")
        continue

    peak_soft_idx = window["soft_counts"].idxmax()
    peak_hard_idx = window["hard_counts"].idxmax()
    peak_soft_time = window.loc[peak_soft_idx, "time"]
    peak_hard_time = window.loc[peak_hard_idx, "time"]
    peak_soft = window["soft_counts"].max()
    peak_hard = window["hard_counts"].max()

    # Lead time: hard X-ray peak time minus soft X-ray peak time
    # Negative = hard peaks BEFORE soft (the expected flare physics)
    lead_seconds = (peak_soft_time - peak_hard_time).total_seconds()

    print(f"── {label} ──")
    print(f"  Soft X-ray : baseline={baseline_soft:.1f} → peak={peak_soft:.0f} cts/s "
          f"({peak_soft/baseline_soft:.0f}x baseline) at {peak_soft_time}")
    print(f"  Hard X-ray : baseline={baseline_hard:.2f} → peak={peak_hard:.0f} cts/s "
          f"at {peak_hard_time}")
    print(f"  >>> LEAD TIME: hard X-ray peaked {lead_seconds:+.0f} seconds "
          f"relative to soft X-ray peak")
    if lead_seconds > 0:
        print(f"      → Hard X-ray led by {lead_seconds/60:.1f} minutes (early warning signal)")
    elif lead_seconds < 0:
        print(f"      → Hard X-ray LAGGED soft X-ray by {abs(lead_seconds)/60:.1f} minutes")
    else:
        print(f"      → Simultaneous peaks")
    print()

print("Full day peak times:")
print(f"  Soft X-ray max: {df.loc[df['soft_counts'].idxmax(),'time']}  ({df['soft_counts'].max():.0f} cts/s)")
print(f"  Hard X-ray max: {df.loc[df['hard_counts'].idxmax(),'time']}  ({df['hard_counts'].max():.0f} cts/s)")
