# SuryaDNA / SolarGuard — Architecture Reference

## Pipeline Overview

```
PRIMARY BRANCH
──────────────────────────────────────────────────────────
SoLEXS (soft X-ray, thermal)    ─┐
                                  ├─→ Data Synchronisation (1s cadence merge)
HEL1OS (hard X-ray, non-thermal) ─┘             ↓
                                       Physics Feature Engine
                                       ┌─────────────────────────────┐
                                       │ spectral_hardening_ratio     │
                                       │ log_hardening_ratio          │
                                       │ hardening_ratio_slope        │
                                       │ soft/hard flux derivatives   │
                                       │ rolling stats (30s, 5min)    │
                                       │ z-scores                     │
                                       │ cross-channel lag            │
                                       └─────────────────────────────┘
                                                    ↓
                                       Forecasting Model (TFT)
                                                    ↓
                                      ┌─────────────────────────┐
                                      │  Nowcasting + Forecasting │
                                      │  • Flare detection        │
                                      │  • B/C/M/X classification │
                                      │  • Lead time estimate     │
                                      │  • TPR / FAR tracking     │
                                      └─────────────────────────┘
                                                    ↓
                                       Space Weather Alert
                                       Flare Event Catalogue


INNOVATION BRANCH (auxiliary scientific layer)
──────────────────────────────────────────────
Physics Features
      ↓
Flare Genome Generator (Autoencoder)
  Input:  (300s × 8 features)
  Latent: 64-dim fingerprint
  Dim selection: reconstruction-error vs latent-dimension analysis
      ↓
Solar Memory Database (FAISS cosine similarity index)
      ↓
Historical Analogue Retrieval (k=5 nearest neighbours)
      ↓
Novel Event Discovery
  Purpose: detect unusual flare behaviour, identify events lacking
  close historical analogues, assist future scientific investigation
  [NOT a primary forecasting component]
```

---

## Key Feature: Spectral Hardening Ratio

**Formula:**  `R(t) = HEL1OS_flux(t) / SoLEXS_flux(t)`

**Physics basis:**
- HEL1OS measures hard X-rays (10–150 keV) — non-thermal emission (impulsive phase)
- SoLEXS measures soft X-rays (1–30 keV) — thermal emission (gradual phase)
- During flare onset, non-thermal emission rises before thermal emission peaks
- The ratio `R(t)` rising steeply signals early-phase particle acceleration

**Observational signature:**
- Quiet Sun:      R(t) ≈ low stable baseline
- Pre-flare:      R(t) rises significantly above baseline
- Flare impulsive phase: R(t) peaks
- Gradual phase:  soft X-rays dominate, R(t) decreases

We investigate the spectral hardening ratio and temporal lag between channels
as physics-informed precursor features for flare forecasting.

---

## Instrument Notes

| Instrument | Band | Physics | Role |
|------------|------|---------|------|
| SoLEXS | Soft X-ray (1–30 keV) | Thermal coronal plasma | Gradual phase indicator |
| HEL1OS | Hard X-ray (10–150 keV) | Non-thermal particle emission | Impulsive phase indicator |
| GOES XRS | Soft X-ray (0.1–0.8 nm) | Thermal | Pre-training baseline only |

> GOES and HEL1OS have different instrument responses and energy bands. GOES data
> is used exclusively for pre-training and baseline reference, not for direct
> transfer to Aditya-L1 hard X-ray analysis.

---

## ISRO Evaluation Criteria Coverage

| Criterion | Addressed By |
|-----------|-------------|
| Flare detection | Spectral hardening z-score trigger + TFT threshold |
| B/C/M/X classification | Autoencoder genome + memory database class voting |
| Forecast lead time | Hardening ratio slope extrapolation |
| False alarm rate | Dual-channel confirmation gate |
| True positive rate | Optimised classification threshold on test set |

---

## Latent Dimension Justification

The 64-dimensional genome vector was selected through reconstruction-error
versus latent-dimension analysis. Lower dimensions (16, 32) showed high
reconstruction error; higher dimensions (128, 256) showed no significant
improvement in flare class separation. 64 provides the best balance between
compression and representational fidelity.

---

## Alert System Scope

The system generates early space-weather alerts that can support operational
decision-making. Forecasting flare occurrence and classification is not
equivalent to predicting specific satellite hardware damage, which depends on
orbital parameters, shielding, and component sensitivity outside this system's scope.

---

## Data Flow Summary

```
GOES-16 XRS (pre-training)
        ↓
    Feature learning → Autoencoder weights (transfer)
        ↓
Aditya-L1 SoLEXS L1 + HEL1OS L1 (primary)
        ↓
    Fine-tune + evaluate → Final model
        ↓
    Nowcast + Forecast output
```
