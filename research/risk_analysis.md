# Risk Analysis

*Known limitations, risks, and mitigation strategies. Being upfront about these
strengthens the project — judges respect honest risk assessment.*

---

## 1. Dataset Limitations

### 1.1 Limited Aditya-L1 operational history
- **Risk:** Aditya-L1 launched September 2023. The dataset covers ~2 years of solar
  activity, which may be insufficient for training a robust classifier from scratch.
- **Mitigation:** Use GOES XRS (30+ year archive) for pre-training; treat Aditya-L1
  as fine-tuning and evaluation dataset.

### 1.2 FITS file format variability
- **Risk:** SoLEXS and HEL1OS Level-1 FITS column names and formats may vary between
  data releases. The parser may require updates when new data versions are released.
- **Mitigation:** `inspect_fits()` utility function for debugging; column-name
  auto-detection logic in `step2_parse_fits.py`.

### 1.3 Data gaps and calibration artefacts
- **Risk:** Level-1 data may contain calibration artefacts, data gaps, or quality-flagged
  periods that could introduce false signals.
- **Mitigation:** Quality flag filtering in parser; background subtraction using
  pre-event quiet window; NaN handling throughout feature engine.

---

## 2. Class Imbalance

### 2.1 Rare high-class events
- **Risk:** X-class flares are rare (tens per solar cycle). The training set will be
  dominated by B and C class events.
- **Impact:** Classifier may default to predicting C-class; high-class TPR may be low.
- **Mitigation:**
  - Weighted cross-entropy loss (weight M/X events higher)
  - Oversampling of M/X windows during training
  - Evaluate per-class metrics separately; report this distribution
  - Consider binary classification (M+ vs sub-M) as primary task

### 2.2 Quiet-Sun overrepresentation
- **Risk:** Majority of Aditya-L1 observation time is quiet Sun, not flare periods.
- **Mitigation:** Sliding window approach; balance flare vs non-flare windows in training

---

## 3. Transfer Learning Risks

### 3.1 GOES → Aditya-L1 instrument mismatch
- **Risk:** GOES XRS measures 0.05–0.4 nm and 0.1–0.8 nm (soft X-ray). HEL1OS measures
  10–150 keV (hard X-ray). These are different energy bands with different instrument
  responses, different units, and different background levels.
- **Impact:** A model pre-trained on GOES cannot be directly applied to HEL1OS data.
- **Mitigation:**
  - GOES data is used ONLY for pre-training the autoencoder on temporal patterns
    (rise/decay profiles, spectral shape evolution)
  - All HEL1OS-specific features are normalised relative to their own baseline
  - Final evaluation is exclusively on Aditya-L1 data
  - This is explicitly documented and NOT presented as direct transfer

### 3.2 Solar cycle phase difference
- **Risk:** GOES training data may span different solar cycle phases than the Aditya-L1
  test period.
- **Mitigation:** Include quiet-day samples from matching solar cycle phase where possible

---

## 4. Forecast Uncertainty

### 4.1 Spectral hardening slope extrapolation
- **Risk:** Linear extrapolation of the hardening ratio slope assumes monotonic rise,
  which is not always true (complex multi-peak flares, sympathetic flares).
- **Mitigation:** Cap extrapolation at 10 minutes; include uncertainty estimate;
  combine with memory-based prediction

### 4.2 Genome similarity does not guarantee class similarity
- **Risk:** Two flares may have similar spectral hardening profiles but different peak
  classes depending on source region geometry, magnetic field configuration, etc.
- **Mitigation:** Report confidence score alongside prediction; use top-5 neighbours
  for voting rather than single nearest neighbour

### 4.3 Novel event flag reliability
- **Risk:** The anomaly threshold is data-dependent. A sparse training set means the
  threshold may be miscalibrated.
- **Mitigation:** Report the threshold and the calibration basis; present novel event
  detection as a research support tool, not an operational output

---

## 5. Operational Scope Limitations

### 5.1 Space weather to satellite operations gap
- **Risk:** Judges or evaluators may conflate "flare forecast" with "satellite safe mode
  trigger". These are different things.
- **Mitigation:** All documentation explicitly states:
  "The system generates early space-weather alerts that can support operational
  decision-making." We do not claim to directly control satellite operations.

### 5.2 No PRADAN real-time API
- **Risk:** PRADAN currently provides data via portal download, not a streaming API.
  Real-time pipeline requires either manual data fetch or a custom polling solution.
- **Mitigation:** Pipeline is designed for batch processing of downloaded FITS files;
  real-time extension is noted as future work

---

## 6. Summary Table

| Risk | Severity | Likelihood | Mitigation Status |
|------|---------|-----------|------------------|
| Limited Aditya-L1 training data | High | Certain | GOES pre-training |
| X-class imbalance | High | Certain | Weighted loss + per-class metrics |
| GOES-HEL1OS instrument mismatch | High | Certain | Documented; GOES for pre-train only |
| Quiet-Sun overrepresentation | Medium | Certain | Window balancing |
| Slope extrapolation error | Medium | Likely | 10-min cap + combined prediction |
| FITS format variability | Medium | Possible | Auto-detect + inspect utility |
| Novel event threshold miscalibration | Medium | Possible | Research support framing |
| Satellite operations overclaim | Low | Possible | Documentation corrected |
