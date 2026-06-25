import pandas as pd
from config import LATENT_DIM_PATH, DATA_DIR

def get_genome_data():
    fingerprints_path = DATA_DIR / "processed" / "fingerprints.csv"
    
    result = {}
    
    if fingerprints_path.exists():
        df = pd.read_csv(fingerprints_path)
        last_row = df.iloc[-1].to_dict()
        result["flare_genome"] = "Genome-64-bit"
        result["latent_vector"] = list(last_row.values())
    else:
        result.update({
            "status": "error",
            "message": "Pipeline output missing",
            "missing_file": str(fingerprints_path),
            "flare_genome": "Mock-Genome-X",
            "latent_vector": [0.1, -0.2, 0.3, 0.5]
        })

    if LATENT_DIM_PATH.exists():
        df_meta = pd.read_csv(LATENT_DIM_PATH)
        result["genome_metadata"] = df_meta.to_dict(orient="records")
    else:
        result.update({
            "status": "error",
            "message": "Pipeline output missing",
            "missing_file": str(LATENT_DIM_PATH),
            "genome_metadata": []
        })

    return result
