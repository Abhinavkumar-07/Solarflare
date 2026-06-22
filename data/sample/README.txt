SAMPLE DATA FOLDER
==================
This folder contains pre-processed sample data so you can test the pipeline
without waiting for PRADAN registration or GOES downloads.

Files placed here by step1_download_goes.py:
  - live_soft_xray.csv   : last 7 days of GOES soft X-ray (no auth needed)
  - live_hard_xray.csv   : last 7 days of GOES hard X-ray (no auth needed)

To test immediately:
  1. Run: python pipeline/step1_download_goes.py
     (live_soft_xray.csv and live_hard_xray.csv will appear in data/raw/goes/)
  2. Run: python pipeline/step3_feature_engine.py
     (uses GOES data as proxy for SoLEXS + HEL1OS)
