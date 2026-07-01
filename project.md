# SolarGuard

## Explainable Solar Flare Forecasting using Spectral Hardening, Flare Genome Intelligence and Solar Memory Retrieval

---

# Project Overview

SolarGuard is an end-to-end explainable solar flare forecasting platform designed for ISRO BAH 2026.

Unlike conventional flare forecasting systems that operate as black boxes, SolarGuard provides scientifically grounded explanations for every prediction.

SolarGuard combines:

- GOES observations
- Aditya-L1 observations
- Spectral Hardening Analysis
- Flare Genome representations
- Solar Memory Database
- Historical analogue retrieval
- Explainable AI
- Retrieval-Augmented reasoning
- Scientific reporting

---

# Vision

Current solar flare forecasting systems answer:

> WHAT may happen

SolarGuard answers:

> WHAT

> WHY

> HOW CONFIDENT

> WHICH HISTORICAL EVENTS SUPPORT IT

> WHAT PHYSICAL EVIDENCE EXISTS

---

# Scientific Innovations

SolarGuard introduces four scientific innovations.

## 1 Spectral Hardening Analysis

Tracks hard X-ray and soft X-ray evolution.

Provides early indications of flare intensification.

Acts as a precursor signal.

Outputs:

- hardening ratio
- trend
- anomaly detection

---

## 2 Flare Genome

Represents solar activity using latent embeddings.

Each flare becomes a 64-dimensional fingerprint.

Enables:

- similarity analysis
- clustering
- retrieval
- explainability

Outputs:

- latent vector
- dominant dimensions
- reconstruction quality

---

## 3 Solar Memory Database

Stores historical flare embeddings.

Uses nearest-neighbour retrieval.

Retrieves:

- similar events
- GOES classes
- peak flux
- timestamps
- similarity scores

Enables historical reasoning.

---

## 4 SolarGuard Intelligence Engine

Evidence-based explainability system.

Uses RAG principles.

Not a chatbot.

Produces deterministic scientific explanations.

Explains:

- prediction reasoning
- confidence
- hardening impact
- historical analogues
- latent interpretation

---

# Architecture

GOES

+

Aditya-L1

↓

Feature Engineering

↓

Autoencoder

↓

Latent Embedding

↓

Flare Genome

↓

Solar Memory Database

↓

Forecasting

↓

SolarGuard Intelligence Engine

↓

FastAPI

↓

React Dashboard

↓

Scientific Reports

---

# Pipeline

Production locked.

Do not modify.

## Step 1

step1_download_goes.py

Data acquisition.

---

## Step 2

step2_parse_fits.py

FITS parsing.

---

## Step 3

step3_feature_engine.py

Feature generation.

---

## Step 4

step4_train_autoencoder.py

Latent representation learning.

Outputs:

autoencoder.pt

fingerprints.csv

---

## Step 5

step5_build_memory_db.py

Memory construction.

Outputs:

memory_metadata.json

FAISS index

historical embeddings

---

## Step 6

step6_forecast.py

Forecast generation.

Outputs:

flare probability

hardening ratio

confidence

prediction class

---

# Backend

FastAPI

Directory:

backend/

---

Implemented endpoints

GET /api/health

GET /api/dashboard

GET /api/forecast

GET /api/genome

GET /api/memory

GET /api/alerts

GET /api/reports

GET /api/explain

---

# Frontend

React

Tailwind

Framer Motion

Recharts

Chart.js

Directory:

frontend/src/

---

Pages

Dashboard

Light Curves

Hardening & Forecast

Flare Genome

Solar Memory DB

Reports

Alerts

Settings

About

---

# SolarGuard Intelligence Engine

SIE

Purpose:

Explain predictions.

Uses:

Forecast

+

Memory Retrieval

+

Genome

+

Hardening Analysis

↓

Evidence

↓

Historical Analogues

↓

Confidence Reasoning

↓

Scientific Summary

---

# Explain API

Endpoint

GET /api/explain

Returns:

```json
{
 "prediction": {},
 "evidence": [],
 "historical_analogues": [],
 "genome_summary": {},
 "scientific_summary": {},
 "confidence_explanation": {}
}
```

---

## Evidence Schema

```json
{
 "title":"",

 "value":"",

 "explanation":"",

 "source":"",

 "pipeline_stage":"",

 "generated_at":""
}
```

---

## Sources

Forecast Pipeline

Hardening Analysis

Solar Memory Database

Flare Genome

---

# Explainability Principles

Deterministic.

No hallucination.

No unsupported claims.

Every explanation must be traceable.

Every statement must include:

source

pipeline_stage

generated_at

---

# Frontend Explainability Components

ExplainPanel

PredictionCard

EvidenceCard

HistoricalAnalogues

GenomeSummary

ScientificSummary

---

# Technologies

Frontend

React

Tailwind

Framer Motion

Recharts

Chart.js

---

Backend

FastAPI

Python

Pydantic

---

Scientific Stack

PyTorch

FAISS

NumPy

Pandas

Scikit-learn

---

Storage

JSON

CSV

FAISS Index

---

Deployment

Docker

GitHub

Vercel

Render

---

# Cost Estimate

Prototype

₹7000–12000

Cloud

₹2500/month

Compute

₹5000

Storage

₹1000

Software

₹0

Open Source

---

# Project Status

Pipeline

✅

Genome

✅

Forecasting

✅

Memory DB

✅

Backend

✅

Frontend

✅

API Layer

✅

Dashboard

✅

Reports

✅

Alerts

✅

Explainability

✅

SIE

✅

Deployment

⬜

Documentation

⬜

Presentation

⬜

Hackathon Demo

⬜

---

# Remaining Work

Deployment

Performance Optimization

Documentation

API Documentation

README

Demo Video

Hackathon Presentation

Final Testing

---

# SolarGuard USP

Conventional Systems

↓

Prediction

SolarGuard

↓

Prediction

+

Flare Genome

+

Memory Retrieval

+

Explainability

+

Historical Analogues

+

Confidence Reasoning

+

Evidence-Based Science

---

# Guiding Principles

Never modify:

pipeline/

models/

research/

tests/

notebooks/

without explicit approval.

Scientific correctness has higher priority than visual effects.

Explainability must always remain evidence-based.

Avoid placeholder data whenever live pipeline outputs exist.

Keep frontend modular.

Keep backend deterministic.

Maintain complete traceability.