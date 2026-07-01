# SolarGuard Architecture

# Explainable Solar Flare Forecasting Platform

Version: 1.0

Status: Production Prototype

---

# System Overview

SolarGuard is an end-to-end scientific forecasting platform designed to predict and explain solar flare activity.

The system integrates:

• GOES observations
• Aditya-L1 observations
• Spectral hardening analysis
• Autoencoder-based latent representations
• Solar Memory Database
• Explainability Engine
• Scientific reporting
• Interactive visualization

---

# High-Level Architecture

```text
GOES Data
       │
       │
Aditya-L1 Data
       │
       ▼

┌─────────────────────┐
│ Data Acquisition    │
│ step1_download      │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ FITS Parsing        │
│ step2_parse_fits    │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ Feature Engineering │
│ step3_feature       │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ Autoencoder         │
│ step4_train         │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ Flare Genome        │
│ 64-D Embedding      │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ Solar Memory DB     │
│ FAISS Retrieval     │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ Forecast Engine     │
│ step6_forecast      │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ Export Layer        │
│ JSON / CSV          │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ FastAPI Backend     │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ React Frontend      │
└─────────────────────┘
       │
       ▼

┌─────────────────────┐
│ SIE                 │
│ Explainability      │
└─────────────────────┘
```

---

# Scientific Pipeline

## Step 1

Data Acquisition

Module:

```text
pipeline/step1_download_goes.py
```

Purpose:

Acquire observations.

Sources:

GOES

Aditya-L1

Output:

raw datasets

---

## Step 2

FITS Parsing

Module:

```text
pipeline/step2_parse_fits.py
```

Purpose:

Extract physical measurements.

Convert FITS files.

Generate clean datasets.

Output:

processed observations

---

## Step 3

Feature Engineering

Module:

```text
pipeline/step3_feature_engine.py
```

Purpose:

Generate numerical descriptors.

Compute:

fluxes

statistics

temporal behaviour

spectral features

Output:

features.csv

---

## Step 4

Autoencoder

Module:

```text
pipeline/step4_train_autoencoder.py
```

Purpose:

Learn latent representations.

Output:

```text
autoencoder.pt
```

```text
fingerprints.csv
```

latent embeddings

---

## Step 5

Solar Memory Database

Module:

```text
pipeline/step5_build_memory_db.py
```

Purpose:

Historical retrieval.

Nearest-neighbour search.

Technology:

FAISS

Outputs:

memory_metadata.json

vector index

historical embeddings

---

## Step 6

Forecasting

Module:

```text
pipeline/step6_forecast.py
```

Outputs:

forecast probability

predicted class

confidence

hardening ratio

active alerts

---

# Flare Genome

Purpose

Represent solar events in latent space.

Dimension

64

Properties

compressive

retrievable

interpretable

comparable

Applications

clustering

retrieval

forecast support

explainability

---

# Solar Memory Database

Technology

FAISS

Inputs

flare embeddings

Outputs

nearest neighbours

similarity score

historical analogues

GOES class

timestamps

peak flux

Use Cases

scientific evidence

retrieval

explanation

confidence support

---

# SolarGuard Intelligence Engine

SIE

Purpose

Explain predictions.

Not a chatbot.

Evidence driven.

Deterministic.

---

Inputs

Forecast

Genome

Hardening

Memory Retrieval

Alerts

Reports

---

Output

Prediction

Evidence

Confidence

Historical Analogues

Genome Summary

Scientific Report

---

API Endpoint

```text
GET /api/explain
```

---

Example

```json
{
 "prediction":{},

 "evidence":[],

 "historical_analogues":[],

 "genome_summary":{},

 "scientific_summary":{},

 "confidence_explanation":{}
}
```

---

# Backend Architecture

Directory

```text
backend/
```

---

Services

forecast_service.py

genome_service.py

memory_service.py

dashboard_service.py

report_service.py

alert_service.py

explain_service.py

---

Routes

```text
/api/health

/api/dashboard

/api/forecast

/api/genome

/api/memory

/api/alerts

/api/reports

/api/explain
```

---

Utilities

logger.py

validation.py

pipeline_runner.py

data_provider.py

---

# Frontend Architecture

Directory

```text
frontend/src
```

---

Pages

SolarGuard_Dashboard.jsx

SolarGuard_LightCurves.jsx

SolarGuard_HardeningForecast.jsx

SolarGuard_FlareGenome.jsx

SolarGuard_SolarMemoryDB.jsx

SolarGuard_Alerts.jsx

SolarGuard_Reports.jsx

SolarGuard_Settings.jsx

SolarGuard_About.jsx

---

Layouts

MainLayout.jsx

---

Components

Sidebar.jsx

TopBar.jsx

StatusCard.jsx

Panel.jsx

ForecastGauge.jsx

GenomeHeatmap.jsx

AlertBanner.jsx

---

Explainability Components

ExplainPanel.jsx

PredictionCard.jsx

EvidenceCard.jsx

HistoricalAnalogues.jsx

GenomeSummary.jsx

ScientificSummary.jsx

---

# Data Flow

```text
GOES

↓

Features

↓

Latent Embedding

↓

Memory DB

↓

Forecast

↓

SIE

↓

FastAPI

↓

React

↓

Dashboard

↓

Scientific Report
```

---

# Technology Stack

Frontend

React

TailwindCSS

Framer Motion

Chart.js

Recharts

---

Backend

FastAPI

Python

Pydantic

---

ML

PyTorch

FAISS

NumPy

Pandas

Scikit-learn

---

Storage

JSON

CSV

FAISS

memory_metadata.json

---

DevOps

Git

GitHub

Docker

Vercel

Render

---

# Explainability Principles

Deterministic

Evidence based

Traceable

Auditable

No hallucinations

No unsupported reasoning

---

Each explanation contains

source

pipeline_stage

generated_at

retrieval_method

---

# Deployment Architecture

```text
React Frontend

↓

Vercel

↓

FastAPI Backend

↓

Render

↓

Export Layer

↓

Pipeline Outputs

↓

CSV

JSON

FAISS

PyTorch Models
```

---

# Current Status

Forecasting

✅

Genome

✅

Memory Retrieval

✅

Dashboard

✅

Backend

✅

Frontend

✅

Reports

✅

Alerts

✅

SIE

✅

Health Endpoint

✅

Documentation

🟡

Deployment

⬜

Demo

⬜

Presentation

⬜

Research Paper

⬜

---

# Guiding Principles

Pipeline remains production locked.

No modifications to:

pipeline/

models/

tests/

research/

notebooks/

Scientific validity takes precedence over aesthetics.

Every prediction must be explainable.

Every explanation must be traceable.

Avoid placeholders when live data exists.

Keep architecture modular.

Maintain separation between:

ML

Backend

Frontend

Explainability