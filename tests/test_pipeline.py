"""
Sanity checks — run before submitting.
  python tests/test_pipeline.py
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import numpy as np
import pandas as pd


def test_spectral_hardening():
    """Spectral hardening ratio must be > 1 when hard > soft."""
    from pipeline.step3_feature_engine import compute_spectral_hardening_ratio
    df = pd.DataFrame({
        "soft_flux": [1e-6, 2e-6, 3e-6],
        "hard_flux": [2e-6, 5e-6, 9e-6],  # hard rising faster
    })
    df = compute_spectral_hardening_ratio(df)
    assert "spectral_hardening_ratio" in df.columns
    assert df["spectral_hardening_ratio"].iloc[-1] == 3.0
    print("PASS: spectral_hardening_ratio computed correctly")


def test_feature_vector_shape():
    """build_feature_vector must return (300, 8) array."""
    from pipeline.step3_feature_engine import (
        compute_spectral_hardening_ratio, compute_flux_derivatives,
        compute_rolling_stats, build_feature_vector
    )
    n = 600
    df = pd.DataFrame({
        "soft_flux": np.random.exponential(1e-6, n),
        "hard_flux": np.random.exponential(1e-7, n),
    })
    df = compute_spectral_hardening_ratio(df)
    df = compute_flux_derivatives(df)
    df = compute_rolling_stats(df)
    vec = build_feature_vector(df)
    assert vec.shape == (300, 8), f"Expected (300,8), got {vec.shape}"
    print(f"PASS: feature vector shape = {vec.shape}")


def test_autoencoder_forward():
    """Autoencoder must compress (8,300) → (latent_dim,) and reconstruct."""
    import torch
    from pipeline.step4_train_autoencoder import FlareGenomeAutoencoder, LATENT_DIM
    model = FlareGenomeAutoencoder()
    x = torch.randn(2, 8, 300)   # batch of 2 windows
    xhat, z = model(x)
    assert z.shape == (2, LATENT_DIM), f"Genome dim wrong: {z.shape}"
    assert xhat.shape[1] == 8,         f"Reconstruction channels wrong: {xhat.shape}"
    print(f"PASS: autoencoder — genome shape={z.shape}, recon shape={xhat.shape}")


def test_anomaly_threshold():
    """Anomaly threshold must be between 0 and 1."""
    from pipeline.step5_build_memory_db import compute_anomaly_threshold
    fp = np.random.randn(100, 64).astype(np.float32)
    threshold = compute_anomaly_threshold(fp)
    assert 0 <= threshold <= 1, f"Threshold out of range: {threshold}"
    print(f"PASS: anomaly threshold = {threshold:.4f}")


def test_nowcast_primary_branch_no_models():
    """Nowcast must run on Primary Branch even without Innovation Branch models."""
    import pandas as pd
    import numpy as np
    from pipeline.step6_forecast import nowcast

    n = 600
    df = pd.DataFrame({
        "soft_flux": np.random.exponential(1e-6, n),
        "hard_flux": np.random.exponential(1e-7, n),
    })

    # Pass model=None, db=None → Primary Branch only
    result = nowcast(df, model=None, db=None)
    assert "triggered" in result
    assert "zscore" in result
    assert result["innovation_branch"] is None
    print(f"PASS: nowcast primary branch — triggered={result['triggered']}, "
          f"zscore={result['zscore']:.2f}")


def test_alert_language():
    """Alert message must not claim direct satellite control."""
    import pandas as pd
    import numpy as np
    from pipeline.step6_forecast import forecast

    n = 600
    df = pd.DataFrame({
        "soft_flux": np.random.exponential(1e-6, n),
        "hard_flux": np.random.exponential(1e-5, n),  # elevated hard flux
    })

    result = forecast(df, model=None, db=None, lead_minutes=10)
    msg = result.get("alert_message", "")
    # Must NOT claim to issue satellite commands
    forbidden = ["safe mode", "switch satellite", "command satellite"]
    for phrase in forbidden:
        assert phrase.lower() not in msg.lower(), \
            f"Alert message contains disallowed operational claim: '{phrase}'"
    # Must contain 'supports' or 'decision-making'
    assert "decision" in msg.lower() or "supports" in msg.lower() or "no alert" in msg.lower()
    print(f"PASS: alert language is operationally scoped correctly")


if __name__ == "__main__":
    print("Running SuryaDNA sanity checks...\n")
    test_spectral_hardening()
    test_feature_vector_shape()
    test_autoencoder_forward()
    test_anomaly_threshold()
    test_nowcast_primary_branch_no_models()
    test_alert_language()
    print("\nAll tests passed!")
