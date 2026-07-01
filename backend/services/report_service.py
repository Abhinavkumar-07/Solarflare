from utils.data_provider import get_forecast, get_genome, get_memory, get_alerts

def get_reports_data():
    fore = get_forecast()
    alerts = get_alerts()
    
    is_live = fore.get("is_live_data", False) and alerts.get("is_live_data", False)
    
    active_cnt = len(alerts.get("active_alerts", []))
    prob = fore.get("flare_probability", 0.0)
    
    summary = f"Dynamically assembled report: Currently {active_cnt} active alerts. Flare probability is {prob:.1%}. Hardening ratio stands at {fore.get('hardening_ratio', 1.0)}."
    
    return {
        "status": "success" if is_live else "error",
        "is_live_data": is_live,
        "latest_report": "SolarGuard Dynamic Report " + fore.get("forecast_timestamp", "Unknown")[:10],
        "report_summary": summary,
        "downloadable_report_metadata": {
            "size": "2MB",
            "format": "PDF",
            "url": "/downloads/reports/latest.pdf"
        }
    }
