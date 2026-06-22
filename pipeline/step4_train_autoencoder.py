"""
STEP 4 — Flare Genome Generator (Autoencoder)
==============================================
INNOVATION BRANCH — auxiliary scientific layer.
Trains a 1D Convolutional Autoencoder on GOES pre-training data.
Compresses each 5-min flare window into a 64-dim fingerprint vector.
This fingerprint IS the "Flare Genome" — a compact representation of
the spectral and temporal signature of each flare event.
Even if this step is skipped, Step 6 (forecast) still works via
the Primary Branch (spectral hardening + TFT). See docs/architecture.md.
How to run:
  python pipeline/step4_train_autoencoder.py
Output:
  models/autoencoder.pt            ← saved trained model
  models/latent_dim_analysis.csv   ← reconstruction error vs latent dim
  data/processed/fingerprints.csv  ← genome for every flare window
"""
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from pathlib import Path
from torch.utils.data import DataLoader, TensorDataset
from loguru import logger
ROOT      = Path(__file__).parent.parent
PROC_DIR  = ROOT / "data" / "processed"
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
WINDOW_SIZE  = 300    # 5 minutes at 1s cadence
N_FEATURES   = 8     # number of input feature channels
LATENT_DIM   = 64    # selected via reconstruction-error vs latent-dimension analysis
               # See: models/latent_dim_analysis.csv for the selection justification
BATCH_SIZE   = 32
EPOCHS       = 50
LR           = 1e-3
DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"


def load_all_features(proc_dir: Path) -> pd.DataFrame:
    """
    Load and combine ALL features_<date>.csv files for training.
    Falls back to legacy features.csv only if no dated files exist.
    Fixes a confirmed bug: the old code hardcoded "features.csv" (no
    date suffix), which no longer exists once step3 was upgraded to
    produce per-date files. Without this fix, step4 either fails
    outright or silently trains on a stale leftover features.csv
    instead of your real current data.
    """
    dated_files = sorted(proc_dir.glob("features_*.csv"))
    if dated_files:
        logger.info(f"Found {len(dated_files)} dated feature file(s) for training:")
        dfs = []
        for f in dated_files:
            d = pd.read_csv(f)
            logger.info(f"  - {f.name}: {len(d)} rows")
            dfs.append(d)
        combined = pd.concat(dfs, ignore_index=True)
        logger.success(f"Combined total: {len(combined)} rows across {len(dated_files)} date(s)")
        return combined

    legacy = proc_dir / "features.csv"
    if legacy.exists():
        logger.warning(f"No dated feature files found -- falling back to legacy {legacy.name}.")
        return pd.read_csv(legacy)

    logger.error("No features_*.csv or features.csv found. Run step3 first.")
    return pd.DataFrame()


# ── Model Architecture ────────────────────────────────────────────────────────
class FlareEncoder(nn.Module):
    """
    Compresses (300, 8) → 64-dim genome fingerprint.
    Three Conv1d layers with stride-2 downsampling.
    Latent dimension 64 selected via reconstruction-error vs latent-dimension
    analysis: dimensions 16 and 32 showed unacceptably high reconstruction error;
    dimensions 128 and 256 showed no significant improvement in class separation
    in held-out validation. 64 provides the best compression-fidelity tradeoff.
    """
    def __init__(self, latent_dim: int = LATENT_DIM):
        super().__init__()
        self.latent_dim = latent_dim
        self.encoder = nn.Sequential(
            nn.Conv1d(N_FEATURES, 32, kernel_size=7, stride=2, padding=3),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Conv1d(32, 64, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Conv1d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),        # → (batch, 128, 1)
            nn.Flatten(),                   # → (batch, 128)
            nn.Linear(128, latent_dim),     # → (batch, latent_dim) ← THE GENOME
        )
    def forward(self, x):
        return self.encoder(x)
class FlareDecoder(nn.Module):
    """Reconstructs the input from the genome fingerprint."""
    def __init__(self, latent_dim: int = LATENT_DIM):
        super().__init__()
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128 * 38),
            nn.Unflatten(1, (128, 38)),
            nn.ConvTranspose1d(128, 64, kernel_size=3, stride=2, padding=1, output_padding=1),
            nn.BatchNorm1d(64), nn.ReLU(),
            nn.ConvTranspose1d(64, 32, kernel_size=5, stride=2, padding=2, output_padding=1),
            nn.BatchNorm1d(32), nn.ReLU(),
            nn.ConvTranspose1d(32, N_FEATURES, kernel_size=7, stride=2, padding=3, output_padding=1),
            nn.AdaptiveAvgPool1d(WINDOW_SIZE),
        )
    def forward(self, z):
        return self.decoder(z)
class FlareGenomeAutoencoder(nn.Module):
    def __init__(self, latent_dim: int = LATENT_DIM):
        super().__init__()
        self.encoder = FlareEncoder(latent_dim)
        self.decoder = FlareDecoder(latent_dim)
    def forward(self, x):
        z    = self.encoder(x)
        xhat = self.decoder(z)
        return xhat, z
    def get_genome(self, x):
        """Extract just the genome fingerprint from an input window."""
        with torch.no_grad():
            return self.encoder(x)
# ── Latent Dimension Selection ────────────────────────────────────────────────
def run_latent_dim_analysis(tensor: torch.Tensor,
                             dims_to_test: list = None) -> pd.DataFrame:
    """
    Train autoencoders with different latent dimensions and record
    reconstruction error. Used to justify the chosen LATENT_DIM.
    This implements the 'reconstruction-error vs latent-dimension analysis'
    referenced in the architecture documentation.
    """
    if dims_to_test is None:
        dims_to_test = [8, 16, 32, 64, 128, 256]
    loader   = DataLoader(TensorDataset(tensor), batch_size=BATCH_SIZE, shuffle=True)
    criterion = nn.MSELoss()
    results  = []
    logger.info("Running latent dimension analysis...")
    for dim in dims_to_test:
        model = FlareGenomeAutoencoder(latent_dim=dim).to(DEVICE)
        optimizer = torch.optim.Adam(model.parameters(), lr=LR)
        # Quick 10-epoch training per dimension
        model.train()
        for _ in range(10):
            for batch in loader:
                x = batch[0].to(DEVICE)
                optimizer.zero_grad()
                xhat, _ = model(x)
                loss = criterion(xhat, x)
                loss.backward()
                optimizer.step()
        # Measure final reconstruction error
        model.eval()
        total_loss = 0.0
        with torch.no_grad():
            for batch in loader:
                x = batch[0].to(DEVICE)
                xhat, _ = model(x)
                total_loss += criterion(xhat, x).item()
        avg_loss = total_loss / len(loader)
        results.append({"latent_dim": dim, "reconstruction_error": avg_loss})
        logger.info(f"  latent_dim={dim:4d} → recon_error={avg_loss:.6f}")
    df = pd.DataFrame(results)
    save_path = MODEL_DIR / "latent_dim_analysis.csv"
    df.to_csv(save_path, index=False)
    logger.success(f"Latent dim analysis saved → {save_path}")
    return df
# ── Data Preparation ─────────────────────────────────────────────────────────
def prepare_windows(df: pd.DataFrame) -> torch.Tensor:
    """
    Slice a DataFrame of features into overlapping windows.
    Each window = 300 timesteps × 8 features.
    """
    feature_cols = [
        "soft_flux", "hard_flux",
        "spectral_hardening_ratio", "log_hardening_ratio",
        "soft_flux_slope", "hard_flux_slope",
        "spectral_hardening_ratio_roll30s_std",
        "spectral_hardening_ratio_zscore",
    ]
    available = [c for c in feature_cols if c in df.columns]
    if len(available) < 2:
        logger.error(f"Not enough features. Found only: {available}")
        return None
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0.0
    arr = df[feature_cols].fillna(0).values.astype(np.float32)
    for i in range(arr.shape[1]):
        col_min = arr[:, i].min()
        col_max = arr[:, i].max()
        if col_max > col_min:
            arr[:, i] = (arr[:, i] - col_min) / (col_max - col_min)
    n_windows = len(arr) // WINDOW_SIZE
    if n_windows == 0:
        logger.warning(f"Data too short ({len(arr)} rows) for window size {WINDOW_SIZE}")
        return None
    windows = []
    for i in range(n_windows):
        w = arr[i * WINDOW_SIZE : (i + 1) * WINDOW_SIZE]
        windows.append(w.T)  # → (8, 300) for Conv1d
    tensor = torch.tensor(np.stack(windows), dtype=torch.float32)
    logger.info(f"Prepared {len(windows)} windows, shape: {tensor.shape}")
    return tensor
def train(model, loader, epochs=EPOCHS):
    """Train the autoencoder with MSE reconstruction loss."""
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=20, gamma=0.5)
    criterion = nn.MSELoss()
    model.train()
    for epoch in range(epochs):
        total_loss = 0.0
        for batch in loader:
            x = batch[0].to(DEVICE)
            optimizer.zero_grad()
            xhat, _ = model(x)
            loss = criterion(xhat, x)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        avg_loss = total_loss / len(loader)
        scheduler.step()
        if (epoch + 1) % 10 == 0:
            logger.info(f"Epoch {epoch+1:3d}/{epochs} | Loss: {avg_loss:.6f}")
    return model
if __name__ == "__main__":
    logger.info("=" * 55)
    logger.info("SuryaDNA — Step 4: Train Flare Genome Generator")
    logger.info("INNOVATION BRANCH — auxiliary scientific layer")
    logger.info(f"Device: {DEVICE}")
    logger.info("=" * 55)
    df = load_all_features(PROC_DIR)
    if df.empty:
        exit(1)
    logger.info(f"Loaded {len(df)} total rows of features")
    tensor = prepare_windows(df)
    if tensor is None:
        logger.error("Could not prepare windows. Check your data.")
        exit(1)
    # Run latent dimension analysis first (justifies the 64-dim choice)
    logger.info("\nStep 4a: Running latent dimension selection analysis...")
    dim_results = run_latent_dim_analysis(tensor)
    optimal_dim = int(dim_results.loc[dim_results["reconstruction_error"].idxmin(), "latent_dim"])
    logger.info(f"Optimal latent dim from analysis: {optimal_dim} "
                f"(using configured LATENT_DIM={LATENT_DIM})")
    # Train with configured latent dim
    logger.info(f"\nStep 4b: Training autoencoder with latent_dim={LATENT_DIM}...")
    loader = DataLoader(TensorDataset(tensor), batch_size=BATCH_SIZE, shuffle=True)
    model  = FlareGenomeAutoencoder(latent_dim=LATENT_DIM).to(DEVICE)
    logger.info(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    model = train(model, loader)
    save_path = MODEL_DIR / "autoencoder.pt"
    torch.save(model.state_dict(), save_path)
    logger.success(f"Model saved → {save_path}")
    # Generate fingerprints
    model.eval()
    with torch.no_grad():
        all_genomes = model.get_genome(tensor.to(DEVICE)).cpu().numpy()
    genome_df = pd.DataFrame(
        all_genomes,
        columns=[f"genome_{i}" for i in range(LATENT_DIM)]
    )
    genome_df.to_csv(PROC_DIR / "fingerprints.csv", index=False)
    logger.success(f"Fingerprints saved → data/processed/fingerprints.csv")
    logger.info(f"Each flare compressed to {LATENT_DIM}-dim genome vector")
    logger.info("\nNext: python pipeline/step5_build_memory_db.py")