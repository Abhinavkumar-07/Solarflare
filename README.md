# SuryaDNA / SolarGuard 🌞
### ISRO Bharatiya Antariksh Hackathon 2025 — PS15: Solar Flare Forecasting & Nowcasting
**Team: Divine Debuggers**
**Primary Data: Aditya-L1 SoLEXS (soft X-ray) + HEL1OS (hard X-ray)**

---

## System Summary

> "Current systems primarily use flux-based forecasting. Our system combines thermal and
> non-thermal X-ray observations from Aditya-L1, extracts physics-informed precursor
> signatures, forecasts flare activity, and provides historical analogue explanations
> through a solar memory framework."

We investigate spectral hardening ratio as a physics-informed feature for solar flare
forecasting using combined SoLEXS and HEL1OS observations. We explore the predictive
value of thermal–non-thermal coupling features such as spectral hardening and temporal
lag between the two channels.

---

## Architecture

```
PRIMARY BRANCH (satisfies all ISRO evaluation criteria)
────────────────────────────────────────────────────────
SoLEXS (soft X-ray)  ─┐
                       ├→ Data Synchronisation
HEL1OS (hard X-ray)  ─┘         ↓
                        Physics Feature Engine
                        (spectral hardening, flux derivatives,
                         rolling stats, cross-channel lag)
                                 ↓
                        Forecasting Model (TFT)
                                 ↓
                     Nowcasting + Forecasting Output
                                 ↓
                      Alerts + Flare Catalogue


INNOVATION BRANCH (auxiliary scientific layer)
────────────────────────────────────────────────
Physics Features
      ↓
Flare Genome Generator (Autoencoder)
      ↓
Solar Memory Database (FAISS)
      ↓
Historical Analogue Retrieval
      ↓
Novel Event Discovery (research support, not primary forecast)
```

> The Innovation Branch is an auxiliary scientific analysis layer. Even if it fails,
> the Primary Branch independently satisfies all ISRO detection and forecasting objectives.

---

## Folder Structure

```
solarguard/
├── pipeline/
│   ├── step1_download_goes.py       ← GOES pre-training data (no login needed)
│   ├── step2_parse_fits.py          ← Parse Aditya-L1 SoLEXS + HEL1OS FITS
│   ├── step3_feature_engine.py      ← Physics feature extraction
│   ├── step4_train_autoencoder.py   ← Flare Genome Generator (Innovation Branch)
│   ├── step5_build_memory_db.py     ← Solar Memory Database (Innovation Branch)
│   └── step6_forecast.py           ← Full end-to-end pipeline
├── research/
│   ├── literature_review.md         ← Existing methods survey
│   ├── novelty_matrix.md            ← Gap analysis table
│   ├── evaluation_protocol.md       ← Train/test, metrics, lead time definition
│   └── risk_analysis.md             ← Limitations, class imbalance, risks
├── data/
│   ├── raw/goes/                    ← GOES-16 XRS downloaded files
│   ├── raw/aditya_l1/               ← SoLEXS + HEL1OS FITS files from PRADAN
│   ├── processed/                   ← Cleaned, merged CSVs
│   └── sample/                      ← Sample data for testing
├── models/                          ← Trained model files
├── notebooks/explore_flare.ipynb    ← Demo visualisation
├── tests/test_pipeline.py           ← Sanity checks
├── docs/architecture.md             ← Architecture reference
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quick Start

```bash
cd solarguard
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python pipeline/step1_download_goes.py   # Start here — no login needed
```

---

## Data Sources

| Source | Purpose | Access |
|--------|---------|--------|
| GOES-16 XRS archive | Pre-training forecast representations & baseline behaviour | Free, no auth |
| Aditya-L1 SoLEXS L1 | Primary soft X-ray observations | PRADAN portal |
| Aditya-L1 HEL1OS L1 | Primary hard X-ray observations | PRADAN portal |

> **GOES note:** GOES historical flare archives are used for pretraining forecasting
> representations and baseline flare behaviour learning. Final model adaptation and
> evaluation are performed using Aditya-L1 SoLEXS and HEL1OS observations. GOES (soft
> X-ray) and HEL1OS (hard X-ray) have different instrument responses and are not
> directly interchangeable.

**PRADAN portal:** https://pradan.issdc.gov.in
Register → Browse → Aditya-L1 → SoLEXS → Level-1 (also download HEL1OS for same dates)

---

## Success Metrics

**Primary (aligned with ISRO evaluation criteria):**
- True Positive Rate (TPR)
- False Alarm Rate (FAR)
- Precision, Recall, F1 Score
- Forecast Lead Time (minutes before soft X-ray peak)

**Secondary (innovation layer):**
- Explanation quality (historical analogue relevance)
- Novel event detection capability

---

## Key Demo Event

X-class flare — February 22, 2024 *(verify exact classification against official ISRO/PRADAN records before citing specific class)*

---

## Running the Full Pipeline

```bash
python pipeline/step1_download_goes.py     # Download GOES training data
# → Place SoLEXS + HEL1OS .fits from PRADAN into data/raw/aditya_l1/
python pipeline/step2_parse_fits.py        # Parse Aditya-L1 FITS files
python pipeline/step3_feature_engine.py   # Extract physics features
python pipeline/step4_train_autoencoder.py # Train Genome Generator
python pipeline/step5_build_memory_db.py  # Build Solar Memory Database
python pipeline/step6_forecast.py         # Run full pipeline
python tests/test_pipeline.py             # Verify everything works
```
