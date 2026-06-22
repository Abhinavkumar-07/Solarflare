"""
STEP 5 — Solar Memory Database (FAISS Vector Store)
====================================================
Indexes all flare genome fingerprints for fast similarity search.
When a new event arrives, searches this database for the most similar
past flares and retrieves their class labels as prior evidence.

How to run:
  python pipeline/step5_build_memory_db.py
"""

import numpy as np
import pandas as pd
import faiss
import json
from pathlib import Path
from loguru import logger

ROOT      = Path(__file__).parent.parent
PROC_DIR  = ROOT / "data" / "processed"
MODEL_DIR = ROOT / "models"
LATENT_DIM = 64


def build_index(fingerprints: np.ndarray) -> faiss.IndexFlatIP:
    """
    Build a FAISS index for cosine similarity search.
    Uses inner product on L2-normalised vectors = cosine similarity.
    """
    norms = np.linalg.norm(fingerprints, axis=1, keepdims=True)
    normalised = fingerprints / (norms + 1e-30)

    index = faiss.IndexFlatIP(LATENT_DIM)   # inner product = cosine after normalisation
    index.add(normalised.astype(np.float32))
    logger.info(f"FAISS index built with {index.ntotal} fingerprints")
    return index


def search_memory(index: faiss.IndexFlatIP,
                  query_genome: np.ndarray,
                  k: int = 5) -> tuple:
    """
    Find k most similar past flares to a new query genome.

    Returns:
        distances  : cosine similarity scores (higher = more similar)
        indices    : positions in the database
    """
    q = query_genome.reshape(1, -1).astype(np.float32)
    q = q / (np.linalg.norm(q) + 1e-30)   # normalise query too
    distances, indices = index.search(q, k)
    return distances[0], indices[0]


def compute_anomaly_threshold(fingerprints: np.ndarray,
                               percentile: float = 95.0) -> float:
    """
    Compute the anomaly detection threshold.
    A new event with cosine distance BELOW this threshold
    (similarity above 1 - threshold) is flagged as a NOVEL EVENT.

    We use the 5th percentile of pairwise distances as threshold
    (equivalently, the 95th percentile of dissimilarities).
    """
    n = min(500, len(fingerprints))   # sample for speed
    sample = fingerprints[:n]
    norms  = np.linalg.norm(sample, axis=1, keepdims=True)
    norm_s = sample / (norms + 1e-30)

    # Pairwise cosine similarities
    sims = norm_s @ norm_s.T
    np.fill_diagonal(sims, np.nan)

    # Anomaly threshold = events that look like nobody in memory
    min_sims = np.nanmin(sims, axis=1)
    threshold = float(np.percentile(min_sims, 100 - percentile))
    logger.info(f"Anomaly threshold (cosine similarity): {threshold:.4f}")
    return threshold


class SolarMemoryDatabase:
    """
    High-level interface for the Solar Memory Database.
    Wraps FAISS index with metadata and anomaly detection.
    """

    def __init__(self):
        self.index      = None
        self.metadata   = []    # list of dicts: {class, timestamp, peak_flux, ...}
        self.threshold  = 0.3   # anomaly threshold (updated by calibrate())

    def build(self, fingerprints: np.ndarray, metadata: list):
        self.index     = build_index(fingerprints)
        self.metadata  = metadata
        self.threshold = compute_anomaly_threshold(fingerprints)

    def query(self, genome: np.ndarray, k: int = 5) -> dict:
        """
        Query with a new flare genome.
        Returns prediction with class probabilities and anomaly flag.
        """
        if self.index is None:
            raise RuntimeError("Database not built. Call build() first.")

        distances, indices = search_memory(self.index, genome, k)

        # Retrieve neighbour metadata
        neighbours = []
        class_votes = {}
        for dist, idx in zip(distances, indices):
            if idx < 0:
                continue
            meta = self.metadata[idx]
            neighbours.append({"similarity": float(dist), **meta})
            cls = meta.get("goes_class", "unknown")[0].upper()  # B/C/M/X
            class_votes[cls] = class_votes.get(cls, 0) + float(dist)

        # Normalise votes to probabilities
        total = sum(class_votes.values()) or 1.0
        class_probs = {k: v / total for k, v in class_votes.items()}

        # Anomaly detection: if best match similarity is below threshold
        best_sim    = float(distances[0]) if len(distances) > 0 else 0.0
        is_novel    = best_sim < self.threshold

        return {
            "neighbours"      : neighbours,
            "class_probs"     : class_probs,
            "predicted_class" : max(class_probs, key=class_probs.get) if class_probs else "unknown",
            "best_similarity" : best_sim,
            "is_novel_event"  : is_novel,
            "confidence"      : best_sim,
        }

    def save(self, path: Path):
        faiss.write_index(self.index, str(path / "faiss_index.bin"))
        with open(path / "memory_metadata.json", "w") as f:
            json.dump({
                "metadata":  self.metadata,
                "threshold": self.threshold
            }, f, indent=2)
        logger.success(f"Memory database saved to {path}")

    @classmethod
    def load(cls, path: Path):
        db = cls()
        db.index = faiss.read_index(str(path / "faiss_index.bin"))
        with open(path / "memory_metadata.json") as f:
            data = json.load(f)
        db.metadata  = data["metadata"]
        db.threshold = data["threshold"]
        logger.info(f"Memory database loaded: {db.index.ntotal} fingerprints")
        return db


if __name__ == "__main__":
    logger.info("=" * 55)
    logger.info("SolarGuard — Step 5: Build Solar Memory Database")
    logger.info("=" * 55)

    fp_path = PROC_DIR / "fingerprints.csv"
    if not fp_path.exists():
        logger.error("fingerprints.csv not found. Run step4 first.")
        exit(1)

    fp_df = pd.read_csv(fp_path)
    fingerprints = fp_df[[c for c in fp_df.columns if c.startswith("genome_")]].values
    logger.info(f"Loaded {len(fingerprints)} fingerprints, dim={fingerprints.shape[1]}")

    # Build metadata — attach class labels if available
    cat_path = ROOT / "data" / "raw" / "goes" / "flare_catalogue.csv"
    if cat_path.exists():
        cat = pd.read_csv(cat_path)
        logger.info(f"Attaching labels from catalogue: {len(cat)} events")
        metadata = []
        for i in range(len(fingerprints)):
            row = cat.iloc[i % len(cat)]   # cycle if fewer catalogue entries
            metadata.append({
                "goes_class": str(row.get("fl_goescls", "C1.0")),
                "peak_flux":  float(row.get("fl_peakflux", 0.0)),
                "timestamp":  str(row.get("event_peaktime", "")),
                "window_idx": i,
            })
    else:
        logger.warning("No flare catalogue found — using placeholder metadata")
        metadata = [{"goes_class": "C1.0", "peak_flux": 1e-6, "timestamp": "", "window_idx": i}
                    for i in range(len(fingerprints))]

    db = SolarMemoryDatabase()
    db.build(fingerprints, metadata)
    db.save(MODEL_DIR)

    # Demo query: use first fingerprint as test
    result = db.query(fingerprints[0])
    logger.info(f"\nDemo query result:")
    logger.info(f"  Predicted class : {result['predicted_class']}")
    logger.info(f"  Class probs     : {result['class_probs']}")
    logger.info(f"  Best similarity : {result['best_similarity']:.4f}")
    logger.info(f"  Novel event?    : {result['is_novel_event']}")

    logger.info("\nNext: python pipeline/step6_forecast.py")
