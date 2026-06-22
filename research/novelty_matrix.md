# Novelty Matrix — Gap Analysis

*For each idea in the system, this table documents:
what exists, what gap we address, and our specific contribution.*

---

| Idea | Existing Work | Gap | Our Contribution |
|------|--------------|-----|-----------------|
| Soft X-ray flare detection | NOAA GOES XRS operational detection; LSTM/CNN papers | Reactive detection; onset-only, no precursor features | Physics feature extraction from SoLEXS L1 with z-score trigger |
| Spectral hardening ratio as ML feature | Spectral hardening studied post-event (RHESSI OSPEX); not used as real-time ML input | No operational system uses hard/soft flux ratio as a live forecasting feature | We investigate R(t) = HEL1OS_flux / SoLEXS_flux as a physics-informed input feature |
| Dual-instrument forecasting (soft + hard X-ray) | Post-event analysis uses RHESSI + GOES together; operational forecasting uses GOES only | Aditya-L1 is the first mission to provide simultaneous SoLEXS + HEL1OS at L1 point | End-to-end ML pipeline exploiting both channels simultaneously |
| Thermal–non-thermal lag feature | Known in astrophysics literature (impulsive vs gradual phase timing) | Not used as a quantitative ML feature for flare forecasting | Cross-channel lag as input feature to feature engine |
| Flare genome / autoencoder fingerprinting | Autoencoders used for anomaly detection in time-series generally; not for solar flare classification | No flare-specific latent representation from physics-informed multi-channel features | Conv1D autoencoder trained on spectral hardening feature windows |
| Historical analogue retrieval | Manual inspection; no automated similarity retrieval | No vector-similarity-based flare archive search for Aditya-L1 observations | FAISS cosine similarity index over 64-dim genome vectors |
| Novel event discovery | Anomaly detection in GOES flux (threshold-based); no genome-distance approach | No method flags events lacking historical analogues in multi-channel feature space | Genome cosine distance threshold for novel event flagging |
| Transformer-based (TFT) solar forecasting | TFT applied to GOES XRS and sunspot indices | Aditya-L1 specific multi-channel physics features not tested with TFT | TFT trained on spectral hardening + derivative features from SoLEXS + HEL1OS |

---

## Claims We Are NOT Making

The following claims are explicitly removed from all documentation because
they are not yet supported by a complete literature review:

- ~~"No existing tool uses spectral hardening ratio as an ML feature."~~
- ~~"Nobody has built this before."~~
- ~~"This is the first system to do X."~~

These are replaced with evidence-backed statements about what we investigate
and what gap we are addressing, which is defensible to scientific reviewers.

---

## Claims We Are Making (defensible)

1. We investigate spectral hardening ratio as a physics-informed feature for solar flare
   forecasting using combined SoLEXS and HEL1OS observations from Aditya-L1.

2. We explore the predictive value of thermal–non-thermal coupling features (spectral
   hardening ratio and temporal lag) for flare classification and lead time estimation.

3. GOES historical flare archives are used for pretraining forecasting representations
   and baseline flare behaviour learning. Final model adaptation and evaluation are
   performed using Aditya-L1 SoLEXS and HEL1OS observations.

4. The latent dimension size was selected through reconstruction-error versus
   latent-dimension analysis.

5. The system generates early space-weather alerts that can support operational
   decision-making.
