# Python Backend Services

This directory contains Python backend services converted from JavaScript.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory with your environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
POLYGON_API_KEY=your_polygon_api_key
POLYGON_BASE_URL=https://api.polygon.io
```

## Usage

### Stock API Service

```python
from services.stock_api import get_stock_data, get_stock_chart_data

# Get comprehensive stock data
result = await get_stock_data('AAPL', chart_days=30)

# Get chart data only
chart_result = await get_stock_chart_data('AAPL', days=30)
```

### Stock Database Service

```python
from services.stock_database import load_user_stocks, save_stock_to_database

# Load user's stocks
stocks = await load_user_stocks('user_id_here')

# Save a new stock
new_stock = await save_stock_to_database(
    user_id='user_id_here',
    ticker='AAPL',
    stock_name='Apple Inc.',
    buy_price=150.00,
    buy_date='2024-01-15'
)
```

### Supabase Client

```python
from services.supabase_client import supabase

# Use the supabase client directly
response = supabase.table('stock_watcher').select('*').execute()
```

## File Structure

- `services/supabase_client.py` - Supabase client configuration
- `services/stock_api.py` - Polygon.io API integration for stock data
- `services/stock_database.py` - Database operations for stocks
- `requirements.txt` - Python dependencies

## Notes

- All functions are async and should be called with `await`
- Date formats: Use 'YYYY-MM-DD' for dates
- The services maintain the same API structure as the JavaScript versions for easy migration

