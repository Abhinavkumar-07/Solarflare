import json
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
import os

# Ensure we can import from pipeline
import sys
ROOT = Path(__file__).parent
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from pipeline.step6_forecast import load_models, nowcast, forecast

PROC_DIR = ROOT / "data" / "processed"
GENERATED_DIR = ROOT / "generated"

def find_latest_features():
    feature_files = sorted(PROC_DIR.glob("features_*.csv"), key=lambda p: p.stat().st_mtime, reverse=True)
    legacy = PROC_DIR / "features.csv"
    if feature_files:
        return feature_files[0]
    elif legacy.exists():
        return legacy
    return None

def main():
    print("Running Export Layer...")
    GENERATED_DIR.mkdir(exist_ok=True)

    feat_path = find_latest_features()
    if not feat_path:
        print("ERROR: No features_*.csv found. Run step3 first.")
        return

    df = pd.read_csv(feat_path)
    print(f"Loaded {len(df)} rows from {feat_path.name}")

    model, db = load_models()
    if model is None:
        print("WARNING: Innovation Branch disabled (models not found)")

    now_res = nowcast(df, model, db)
    fore_res = forecast(df, model, db, lead_minutes=10)

    # 1. dashboard.json
    prob = fore_res.get("flare_probability", 0.0)
    dashboard_data = {
        "forecast_probability": prob,
        "active_alert": prob > 0.6,
        "hardening_index": fore_res.get("current_hardening_ratio"),
        "last_update_time": datetime.now(timezone.utc).isoformat(),
        "current_solar_status": "Active" if prob > 0.5 else "Quiet",
        "mission_status": "GOES-16 Online"
    }
    
    # 2. forecast.json
    forecast_data = {
        "flare_probability": prob,
        "predicted_flare_class": fore_res.get("predicted_class", "unknown"),
        "confidence_score": fore_res.get("innovation_branch", {}).get("confidence", 0.0) if fore_res.get("innovation_branch") else 0.0,
        "hardening_ratio": fore_res.get("current_hardening_ratio"),
        "forecast_timestamp": fore_res.get("timestamp")
    }

    # 3. genome.json
    genome_data = {
        "flare_genome": "Genome-64-bit",
        "latent_vector": [],
        "genome_metadata": []
    }
    if now_res.get("innovation_branch"):
        genome_data["latent_vector"] = now_res["innovation_branch"].get("genome", [])
    
    # Load latent_dim_analysis.csv for metadata
    latent_dim_path = ROOT / "models" / "latent_dim_analysis.csv"
    if latent_dim_path.exists():
        genome_data["genome_metadata"] = pd.read_csv(latent_dim_path).to_dict(orient="records")

    # 4. memory.json
    memory_data = {
        "nearest_historical_events": [],
        "historical_flare_metadata": []
    }
    if now_res.get("innovation_branch"):
        # Resolve real metadata by locating the corresponding window in the features dataset
        dated_files = sorted(PROC_DIR.glob("features_*.csv"))
        if dated_files:
            combined_df = pd.concat([pd.read_csv(f) for f in dated_files], ignore_index=True)
        else:
            combined_df = pd.read_csv(PROC_DIR / "features.csv") if (PROC_DIR / "features.csv").exists() else None

        window_size = 300
        neighbours = now_res["innovation_branch"].get("neighbours", [])
        
        for i, n in enumerate(neighbours):
            window_idx = n.get("window_idx", i)
            
            if combined_df is not None and len(combined_df) > window_idx * window_size:
                start_idx = window_idx * window_size
                end_idx = start_idx + window_size
                window_df = combined_df.iloc[start_idx:end_idx]
                
                max_row = window_df.loc[window_df["soft_flux"].idxmax()] if not window_df.empty else None
                if max_row is not None:
                    timestamp = str(max_row["time"])
                    peak_flux = float(max_row["soft_flux"])
                    
                    # Convert Aditya L1 peak counts to a proxy GOES class 
                    if peak_flux > 10000:
                        goes_class = "X1.2"
                    elif peak_flux > 1000:
                        goes_class = "M2.4"
                    elif peak_flux > 500:
                        goes_class = "C8.1"
                    elif peak_flux > 200:
                        goes_class = "C3.5"
                    elif peak_flux > 100:
                        goes_class = "B8.0"
                    else:
                        goes_class = "B2.0"
                else:
                    timestamp = f"Unknown-{window_idx}"
                    peak_flux = 0.0
                    goes_class = "Unknown"
            else:
                timestamp = f"Unknown-{window_idx}"
                peak_flux = n.get("peak_flux", 0.0)
                goes_class = n.get("goes_class", "C1.0")

            memory_data["nearest_historical_events"].append({
                "rank": i + 1,
                "event_id": f"EVT-WIN-{window_idx}",
                "goes_class": goes_class,
                "timestamp": timestamp,
                "similarity_score": n.get("similarity", 0.0),
                "peak_flux": peak_flux
            })
    
    # Load memory_metadata.json for historical data and resolve its placeholders
    memory_meta_path = ROOT / "models" / "memory_metadata.json"
    if memory_meta_path.exists():
        with open(memory_meta_path, "r") as f:
            meta = json.load(f)
            historical_metadata = meta.get("metadata", [])[:50]
            
            # Resolve real metadata for these historical entries just like neighbours
            for item in historical_metadata:
                window_idx = item.get("window_idx", 0)
                if combined_df is not None and len(combined_df) > window_idx * window_size:
                    start_idx = window_idx * window_size
                    end_idx = start_idx + window_size
                    window_df = combined_df.iloc[start_idx:end_idx]
                    
                    max_row = window_df.loc[window_df["soft_flux"].idxmax()] if not window_df.empty else None
                    if max_row is not None:
                        item["timestamp"] = str(max_row["time"])
                        peak_flux = float(max_row["soft_flux"])
                        item["peak_flux"] = peak_flux
                        
                        if peak_flux > 10000:
                            item["goes_class"] = "X1.2"
                        elif peak_flux > 1000:
                            item["goes_class"] = "M2.4"
                        elif peak_flux > 500:
                            item["goes_class"] = "C8.1"
                        elif peak_flux > 200:
                            item["goes_class"] = "C3.5"
                        elif peak_flux > 100:
                            item["goes_class"] = "B8.0"
                        else:
                            item["goes_class"] = "B2.0"
                else:
                    if not item.get("timestamp"):
                        item["timestamp"] = f"Unknown-{window_idx}"
                        
            memory_data["historical_flare_metadata"] = historical_metadata

    # 5. alerts.json
    active_alerts = []
    if now_res.get("triggered"):
        active_alerts.append(now_res.get("message", "Nowcast Alert Triggered"))
    if fore_res.get("alert"):
        active_alerts.append(fore_res.get("message", "Forecast Alert Triggered"))
        
    alerts_data = {
        "active_alerts": active_alerts,
        "alert_severity": "High" if len(active_alerts) > 0 else "Low",
        "alert_time": datetime.now(timezone.utc).isoformat()
    }

    # Save all to generated/
    with open(GENERATED_DIR / "dashboard.json", "w") as f:
        json.dump(dashboard_data, f, indent=2)
    with open(GENERATED_DIR / "forecast.json", "w") as f:
        json.dump(forecast_data, f, indent=2)
    with open(GENERATED_DIR / "genome.json", "w") as f:
        json.dump(genome_data, f, indent=2)
    with open(GENERATED_DIR / "memory.json", "w") as f:
        json.dump(memory_data, f, indent=2)
    with open(GENERATED_DIR / "alerts.json", "w") as f:
        json.dump(alerts_data, f, indent=2)

    print(f"Export completed. Files saved to {GENERATED_DIR}")

if __name__ == "__main__":
    main()
