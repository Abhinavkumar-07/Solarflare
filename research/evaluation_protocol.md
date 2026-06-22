# Evaluation Protocol

*Defines exactly how the system will be evaluated — judges will ask these questions.*

---

## 1. Train / Test Split

### Strategy
- **Pre-training:** GOES-16 XRS archive (multi-year, multiple flare classes)
- **Fine-tuning:** Aditya-L1 SoLEXS + HEL1OS data (2023 onwards)
- **Test set:** Held-out Aditya-L1 events NOT used during training

### Temporal split rule
- Training window: events before cutoff date (e.g., before 2024-10-01)
- Validation window: events 2024-10-01 to 2025-03-01
- Test window: events after 2025-03-01 (completely unseen)

> **Caution:** No information from future timesteps must leak into training windows.
> Use strict time-based splits, not random shuffles.

### Class balance
- The GOES archive is heavily class-imbalanced (B >> C >> M > X)
- Mitigation: weighted loss function, oversampling of M/X windows
- Document the class distribution clearly in all results tables

---

## 2. Metrics

### Primary metrics (ISRO evaluation aligned)

| Metric | Formula | Target |
|--------|---------|--------|
| True Positive Rate (TPR / Recall) | TP / (TP + FN) | Maximise |
| False Alarm Rate (FAR) | FP / (FP + TN) | Minimise |
| Precision | TP / (TP + FP) | Maximise |
| F1 Score | 2 × (Precision × Recall) / (Precision + Recall) | Maximise |
| Forecast Lead Time | Minutes before soft X-ray peak | Maximise |

### Secondary metrics (innovation layer)

| Metric | Definition |
|--------|-----------|
| Analogue quality | GOES class match rate of top-5 retrieved neighbours |
| Novel event recall | Fraction of truly unusual events flagged by genome distance |
| Reconstruction error | MSE between input and autoencoder reconstruction |

### Per-class reporting
Report metrics separately for each GOES class: B, C, M, X
Do not report aggregate-only metrics — class-level breakdown is required.

---

## 3. Lead Time Calculation

**Definition:** Lead time = time between system alert trigger and observed soft
X-ray peak flux (SoLEXS peak).

**Measurement procedure:**
1. Record timestamp when spectral hardening z-score first exceeds threshold (t_alert)
2. Record timestamp of SoLEXS peak flux (t_peak)
3. Lead time = t_peak − t_alert (in minutes)
4. Report: mean lead time, median lead time, distribution across test events

**Caveat:** Lead time is event-dependent. Report distribution, not a single number.

---

## 4. False Alarm Rate Calculation

**Definition:** FAR = number of alerts without a subsequent GOES flare / total alerts

**Time window:** An alert is a true positive if a flare of target class (M or above)
occurs within 30 minutes of the alert timestamp.

**Background period:** Use quiet-Sun windows to compute background alert rate.

---

## 5. Baseline Comparisons

| Baseline | Description |
|----------|-------------|
| GOES threshold only | Alert when SoLEXS flux exceeds C-class threshold |
| Slope-only | Alert when 5-min flux slope exceeds fixed threshold |
| Memory retrieval only | Alert based on genome cosine distance alone |
| Full system | All components combined |

---

## 6. Demo Event Verification

Before citing any specific flare in documentation or the presentation:

- [ ] Confirm event date and GOES class from official ISRO source or PRADAN catalogue
- [ ] Confirm it is within the Aditya-L1 observation period
- [ ] Check whether ISRO has published official event lists for SoLEXS/HEL1OS
- [ ] Do NOT state superlatives (e.g., "largest flare") without a cited official source

---

## 7. Reporting Template

For each evaluated event, report:
```
Event:       [date, GOES class — cited source]
True class:  [B/C/M/X]
Predicted:   [B/C/M/X]
Confidence:  [0–1]
Lead time:   [minutes] (time from alert to SoLEXS peak)
Novel flag:  [True/False]
Alert:       [True/False]
```
