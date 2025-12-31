"""
FastAPI backend server for stock portfolio application
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel
import asyncio
import os
from services.stock_api import (
    get_stock_data,
    get_stock_chart_data,
    get_historical_stock_data
)
from services.stock_database import (
    load_user_stocks,
    save_stock_to_database,
    remove_stock_from_database,
    ensure_user_stocks_table,
    test_rls_policies
)

app = FastAPI(title="Stock Portfolio API", version="1.0.0")

# Get allowed origins from environment variable (for production)
# Format: "https://your-app.onrender.com,http://localhost:5173"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Default to localhost for development
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174"
    ]

# CORS middleware to allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class StockRequest(BaseModel):
    ticker: str
    chart_days: Optional[int] = 30
    historical_date: Optional[str] = None

class SaveStockRequest(BaseModel):
    ticker: str
    stock_name: str
    buy_price: float
    buy_date: str

class StockResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

# Dependency to get user ID from Authorization header
async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # In a real app, you'd verify the JWT token here
    # For now, we'll expect format: "Bearer {user_id}"
    try:
        if authorization.startswith("Bearer "):
            user_id = authorization.replace("Bearer ", "")
            return user_id
        else:
            raise HTTPException(status_code=401, detail="Invalid authorization format")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authorization: {str(e)}")

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Stock Portfolio API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Stock API endpoints
@app.post("/api/stocks/data", response_model=StockResponse)
async def get_stock_info(request: StockRequest):
    """Get comprehensive stock data"""
    try:
        result = await get_stock_data(
            request.ticker,
            chart_days=request.chart_days or 30,
            historical_date=request.historical_date
        )
        if result.get('success'):
            return StockResponse(success=True, data=result)
        else:
            return StockResponse(success=False, error=result.get('error', 'Unknown error'))
    except Exception as e:
        return StockResponse(success=False, error=str(e))

@app.get("/api/stocks/{ticker}/chart")
async def get_chart_data(ticker: str, days: int = 30):
    """Get stock chart data"""
    try:
        result = await get_stock_chart_data(ticker, days)
        if result.get('success'):
            return {"success": True, "data": result}
        else:
            raise HTTPException(status_code=404, detail=result.get('error', 'Chart data not found'))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stocks/{ticker}/historical")
async def get_historical_data(ticker: str, date: str):
    """Get historical stock price for a specific date"""
    try:
        result = await get_historical_stock_data(ticker, date)
        if result.get('success'):
            return {"success": True, "data": result}
        else:
            raise HTTPException(status_code=404, detail=result.get('error', 'Historical data not found'))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Database endpoints
@app.get("/api/user/stocks")
async def get_user_stocks(user_id: str = Depends(get_user_id)):
    """Get all stocks for the authenticated user"""
    try:
        stocks = await load_user_stocks(user_id)
        return {"success": True, "data": stocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/stocks")
async def save_stock(request: SaveStockRequest, user_id: str = Depends(get_user_id)):
    """Save a new stock for the authenticated user"""
    try:
        saved_stock = await save_stock_to_database(
            user_id=user_id,
            ticker=request.ticker,
            stock_name=request.stock_name,
            buy_price=request.buy_price,
            buy_date=request.buy_date
        )
        return {"success": True, "data": saved_stock}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/user/stocks/{stock_id}")
async def delete_stock(stock_id: int, user_id: str = Depends(get_user_id)):
    """Delete a stock for the authenticated user"""
    try:
        await remove_stock_from_database(stock_id)
        return {"success": True, "message": "Stock deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Database setup endpoints
@app.get("/api/database/check")
async def check_database():
    """Check if database table exists"""
    try:
        result = await ensure_user_stocks_table()
        return result
    except Exception as e:
        return {"exists": False, "error": str(e)}

@app.get("/api/database/test-rls")
async def test_rls():
    """Test RLS policies"""
    try:
        result = await test_rls_policies()
        return result
    except Exception as e:
        return {"canAccess": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

