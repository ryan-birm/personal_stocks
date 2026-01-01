"""
FastAPI Backend Server

This is your API server that connects:
- Frontend (React) → calls these endpoints
- Database (Supabase) → stores/retrieves data

Flow: React → FastAPI (this file) → Database
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import os

# Import your database service
from services.database import (
    get_items_from_db,
    create_item_in_db,
    update_item_in_db,
    delete_item_from_db
)

app = FastAPI(title="API", version="1.0.0")

# CORS configuration - allows React frontend to call this API
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# REQUEST/RESPONSE MODELS (Pydantic)
# ============================================

class ItemCreate(BaseModel):
    """Model for creating a new item"""
    name: str
    description: Optional[str] = None

class ItemUpdate(BaseModel):
    """Model for updating an item"""
    name: Optional[str] = None
    description: Optional[str] = None

# ============================================
# AUTHENTICATION HELPER
# ============================================

async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract user ID from Authorization header
    Frontend sends: Authorization: Bearer {user_id}
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        if authorization.startswith("Bearer "):
            user_id = authorization.replace("Bearer ", "")
            return user_id
        else:
            raise HTTPException(status_code=401, detail="Invalid authorization format")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authorization: {str(e)}")

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {"message": "API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Example: Get all items for user
@app.get("/api/items")
async def get_items(user_id: str = Depends(get_user_id)):
    """
    GET /api/items
    Returns all items for the authenticated user
    """
    try:
        # Call database service to get data
        items = await get_items_from_db(user_id)
        return {"success": True, "data": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example: Create new item
@app.post("/api/items")
async def create_item(item: ItemCreate, user_id: str = Depends(get_user_id)):
    """
    POST /api/items
    Creates a new item for the authenticated user
    """
    try:
        # Call database service to save data
        new_item = await create_item_in_db(user_id, item.name, item.description)
        return {"success": True, "data": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example: Update item
@app.put("/api/items/{item_id}")
async def update_item(item_id: int, item: ItemUpdate, user_id: str = Depends(get_user_id)):
    """
    PUT /api/items/{item_id}
    Updates an existing item
    """
    try:
        updated_item = await update_item_in_db(item_id, user_id, item.name, item.description)
        return {"success": True, "data": updated_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example: Delete item
@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int, user_id: str = Depends(get_user_id)):
    """
    DELETE /api/items/{item_id}
    Deletes an item
    """
    try:
        await delete_item_from_db(item_id, user_id)
        return {"success": True, "message": "Item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
