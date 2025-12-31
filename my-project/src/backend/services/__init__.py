"""
Backend services package
"""
from .supabase_client import supabase
from .stock_api import (
    get_stock_data,
    get_historical_stock_data,
    get_stock_chart_data,
    get_stock_full_info
)
from .stock_database import (
    test_rls_policies,
    ensure_user_stocks_table,
    load_user_stocks,
    save_stock_to_database,
    remove_stock_from_database
)

__all__ = [
    'supabase',
    'get_stock_data',
    'get_historical_stock_data',
    'get_stock_chart_data',
    'get_stock_full_info',
    'test_rls_policies',
    'ensure_user_stocks_table',
    'load_user_stocks',
    'save_stock_to_database',
    'remove_stock_from_database',
]

