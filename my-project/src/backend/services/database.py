"""
Database Service - Connects FastAPI to Supabase Database

This file contains functions that interact with your Supabase database.
FastAPI endpoints call these functions.

Flow: FastAPI → database.py → Supabase
"""
from typing import List, Dict, Any, Optional
from .supabase_client import supabase


# ============================================
# EXAMPLE DATABASE FUNCTIONS
# Replace these with your own database operations
# ============================================

async def get_items_from_db(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all items from database for a specific user
    
    Args:
        user_id: The user's ID from Supabase auth
    
    Returns:
        List of items from the database
    """
    try:
        # Query Supabase database
        # Replace 'your_table_name' with your actual table name
        result = supabase.table('your_table_name').select('*').eq('user_id', user_id).execute()
        
        # Return the data
        return result.data if hasattr(result, 'data') else []
    except Exception as e:
        print(f'Error getting items from database: {e}')
        raise e


async def create_item_in_db(user_id: str, name: str, description: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new item in the database
    
    Args:
        user_id: The user's ID
        name: Item name
        description: Optional description
    
    Returns:
        The created item
    """
    try:
        # Insert into Supabase database
        # Replace 'your_table_name' with your actual table name
        result = supabase.table('your_table_name').insert({
            'user_id': user_id,
            'name': name,
            'description': description
        }).execute()
        
        # Return the created item
        if hasattr(result, 'data') and result.data:
            return result.data[0]
        raise Exception('No data returned from database')
    except Exception as e:
        print(f'Error creating item in database: {e}')
        raise e


async def update_item_in_db(item_id: int, user_id: str, name: Optional[str] = None, description: Optional[str] = None) -> Dict[str, Any]:
    """
    Update an existing item in the database
    
    Args:
        item_id: The item's ID
        user_id: The user's ID (for security - ensure user owns the item)
        name: New name (optional)
        description: New description (optional)
    
    Returns:
        The updated item
    """
    try:
        # Build update data (only include fields that are provided)
        update_data = {}
        if name is not None:
            update_data['name'] = name
        if description is not None:
            update_data['description'] = description
        
        # Update in Supabase database
        # Replace 'your_table_name' with your actual table name
        result = supabase.table('your_table_name').update(update_data).eq('id', item_id).eq('user_id', user_id).execute()
        
        if hasattr(result, 'data') and result.data:
            return result.data[0]
        raise Exception('Item not found or update failed')
    except Exception as e:
        print(f'Error updating item in database: {e}')
        raise e


async def delete_item_from_db(item_id: int, user_id: str) -> bool:
    """
    Delete an item from the database
    
    Args:
        item_id: The item's ID
        user_id: The user's ID (for security - ensure user owns the item)
    
    Returns:
        True if successful
    """
    try:
        # Delete from Supabase database
        # Replace 'your_table_name' with your actual table name
        result = supabase.table('your_table_name').delete().eq('id', item_id).eq('user_id', user_id).execute()
        
        return True
    except Exception as e:
        print(f'Error deleting item from database: {e}')
        raise e

