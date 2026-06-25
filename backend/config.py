import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MEMORY_METADATA_PATH = MODELS_DIR / "memory_metadata.json"
LATENT_DIM_PATH = MODELS_DIR / "latent_dim_analysis.csv"
