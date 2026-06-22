# Literature Review — Solar Flare Forecasting

*Required reading before claiming novelty. Every claim in the system documentation
must be traceable to either an existing method (gap analysis) or an original contribution.*

---

## 1. Operational / Agency Methods

### 1.1 NOAA SWPC
- **Method:** GOES XRS soft X-ray flux threshold detection (X-ray background + slope)
- **Classification:** Real-time B/C/M/X based on peak 0.1–0.8 nm flux
- **Limitation:** Primarily reactive (post-onset detection); limited forecasting lead time
- **Reference:** NOAA Space Weather Prediction Center, xray_events product documentation

### 1.2 NOAA MOSWOC / SWOF
- **Method:** Human forecaster + solar region pattern matching
- **Lead time:** 24–72 hr probabilistic forecasts (not physics-triggered)
- **Limitation:** Not automated; relies on active region monitoring (GOES/SDO AIA)

### 1.3 NASA CCMC (Community Coordinated Modeling Center)
- **Method:** Ensemble of model runs (ENLIL, WSA-ENLIL for CME propagation)
- **Focus:** CME arrival, not flare precursor classification
- **Limitation:** Not optimised for flare X-ray classification

---

## 2. ML-Based Flare Forecasting Methods

### 2.1 LSTM / RNN on GOES XRS
- **Method:** Time-series LSTM trained on GOES XRS soft X-ray flux
- **Features:** Raw flux, flux derivative, background flux
- **Performance:** ~0.85 TSS on M/X class in well-studied papers
- **Limitation:** Single-instrument, soft X-ray only; no hard X-ray coupling
- **Representative work:** e.g., Liu et al. 2019, Nishizuka et al. 2018

### 2.2 CNN on SDO/HMI Magnetograms
- **Method:** Image classification on solar active region magnetograms
- **Features:** Magnetic field configuration (PIL, AR complexity)
- **Performance:** High skill for M/X prediction 24 hr ahead
- **Limitation:** Requires full-disk optical imaging; not available on Aditya-L1
- **Representative work:** Huang et al. 2018, Jonas et al. 2018

### 2.3 Transformer / Attention-based Methods
- **Method:** Temporal Fusion Transformer (TFT) or vanilla Transformer on solar indices
- **Features:** GOES flux, sunspot number, active region parameters
- **Performance:** Comparable to or better than LSTM on standard benchmarks
- **Limitation:** Usually trained on GOES-only soft X-ray; no dual-instrument physics features
- **Representative work:** Emerging work 2022–2024 using PyTorch-Forecasting

### 2.4 Physics-Informed Neural Networks (PINNs)
- **Method:** Neural networks with physics constraints (e.g., flux conservation)
- **Status:** Mostly theoretical for solar flares; limited operational deployment
- **Limitation:** Requires closed-form physics model; impulsive flare dynamics are complex

---

## 3. Hard X-ray / Dual-Channel Methods

### 3.1 RHESSI (Reuven Ramaty High Energy Solar Spectroscopic Imager)
- **Data:** Hard X-ray spectroscopy (3 keV – 17 MeV)
- **Method:** Spectral fitting of thermal + non-thermal components (OSPEX)
- **Use:** Post-event analysis; spectral index, photon spectral hardening
- **Limitation:** Mission ended 2018; not real-time forecasting
- **Reference:** Lin et al. 2002, Smith et al. 2002

### 3.2 BATSE / Fermi GBM Solar Flare Studies
- **Data:** Gamma-ray burst monitor (hard X-ray / gamma)
- **Method:** Temporal and spectral analysis of impulsive phase
- **Limitation:** Not designed for solar monitoring; no operational forecasting

### 3.3 Spectral Hardening in the Literature
- The concept of spectral hardening (photon spectral index changing during flare evolution)
  is well established in hard X-ray spectroscopy (RHESSI, Fermi papers)
- **Gap:** Using the *ratio* of hard-to-soft X-ray flux as a real-time ML feature
  for operational forecasting has not been evaluated in the context of Aditya-L1
  SoLEXS + HEL1OS combined observations
- **Our contribution:** We investigate this ratio as a physics-informed feature for
  the SoLEXS + HEL1OS instrument pair specifically

---

## 4. Aditya-L1 Specific Work

### 4.1 SoLEXS Design and Calibration
- **Reference:** ISRO SoLEXS instrument paper (cite from PRADAN documentation)
- **Note:** Level-1 data calibration specifics must be confirmed from PRADAN docs

### 4.2 HEL1OS Design and Calibration
- **Reference:** ISRO HEL1OS instrument paper (cite from PRADAN documentation)
- **Note:** HEL1OS energy band and time resolution must be confirmed from instrument docs

### 4.3 Published Aditya-L1 Flare Detections
- **Action required:** Search arXiv and ISRO publications for any peer-reviewed papers
  on Aditya-L1 flare observations (2023–2025) before finalising novelty claims
- **Caution:** Do not claim specific flare records (e.g., "largest X-class seen by
  Aditya-L1") without citing the official ISRO source or PRADAN event catalogue

---

## 5. Summary of Gaps Addressed

| Gap | Evidence | Our Approach |
|-----|---------|-------------|
| Single-instrument (GOES soft X-ray only) forecasting | Nishizuka 2018, Liu 2019 | Dual-instrument SoLEXS + HEL1OS |
| No thermal–non-thermal coupling feature in ML forecasting | Absence in reviewed literature | Spectral hardening ratio as physics-informed feature |
| No operational Aditya-L1 ML forecasting pipeline | No published system found (verify) | End-to-end pipeline for PRADAN data |
| Hard X-ray only used for post-event analysis | RHESSI papers | Real-time HEL1OS feature in forecasting loop |

---

## Action Items Before Submission

- [ ] Search arXiv for "Aditya-L1 SoLEXS flare" to find any published work
- [ ] Verify February 2024 flare classification from official ISRO source
- [ ] Cite PRADAN instrument documentation for SoLEXS and HEL1OS specs
- [ ] Add DOIs for all representative works cited above
- [ ] Review NOAA SWPC product documentation for operational baseline comparison
