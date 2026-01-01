"""
Backend services package
"""
from .supabase_client import supabase
from .database import (
    get_items_from_db,
    create_item_in_db,
    update_item_in_db,
    delete_item_from_db
)

__all__ = [
    'supabase',
    'get_items_from_db',
    'create_item_in_db',
    'update_item_in_db',
    'delete_item_from_db',
]
