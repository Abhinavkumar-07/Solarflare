from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import dashboard, forecast, genome, memory, alerts, reports, health, explain
from utils.logger import logger
import time
from fastapi import Request

app = FastAPI(title="SolarGuard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code}", extra={"process_time": process_time})
    return response

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Forecast"])
app.include_router(genome.router, prefix="/api/genome", tags=["Genome"])
app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(explain.router, prefix="/api/explain", tags=["Explain"])

@app.get("/")
def root():
    return {"message": "SolarGuard API is running."}
