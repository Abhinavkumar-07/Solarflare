from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import dashboard, forecast, genome, memory, alerts, reports

app = FastAPI(title="SolarGuard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Forecast"])
app.include_router(genome.router, prefix="/api/genome", tags=["Genome"])
app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def root():
    return {"message": "SolarGuard API is running."}
