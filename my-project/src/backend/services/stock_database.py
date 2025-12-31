"""
Stock database service for Supabase operations
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from supabase_client import supabase
from stock_api import get_stock_data, get_historical_stock_data


def get_last_trading_day(date: datetime) -> datetime:
    """Get the last trading day (adjusts weekends to Friday)"""
    day = date
    day_of_week = day.weekday()  # 0 = Monday, 6 = Sunday
    
    if day_of_week == 6:  # Sunday
        day = day - timedelta(days=2)  # Go back to Friday
    elif day_of_week == 5:  # Saturday
        day = day - timedelta(days=1)  # Go back to Friday
    
    return day


async def test_rls_policies() -> Dict[str, Any]:
    """Test RLS policies for stock_watcher table"""
    try:
        current_user_response = supabase.auth.get_user()
        if not current_user_response or not current_user_response.user:
            return {'canAccess': False, 'error': 'No authenticated user'}
        
        # Test SELECT permission
        select_test = supabase.table('stock_watcher').select('id').limit(1).execute()
        
        # Check for permission error (42501 is PostgreSQL permission denied)
        if hasattr(select_test, 'error') and select_test.error:
            error_code = getattr(select_test.error, 'code', None)
            if error_code == '42501' or 'permission denied' in str(select_test.error).lower():
                return {
                    'canAccess': False,
                    'error': (
                        'No SELECT policy exists. Need: '
                        'CREATE POLICY "Users can view their own stocks" '
                        'ON stock_watcher FOR SELECT USING (auth.uid() = user_id);'
                    )
                }
        
        return {'canAccess': True, 'error': None}
    except Exception as err:
        return {'canAccess': False, 'error': str(err)}


async def ensure_user_stocks_table() -> Dict[str, Any]:
    """Check if stock_watcher table exists and verify schema"""
    try:
        # Try to query the table to see if it exists and check schema
        result = (
            supabase.table('stock_watcher')
            .select('id, user_id, ticker, stock_name, buy_price, buy_date')
            .limit(1)
            .execute()
        )
        
        # Check for errors
        if hasattr(result, 'error') and result.error:
            error_msg = str(result.error)
            if '42P01' in error_msg or 'does not exist' in error_msg.lower():
                print('ERROR: stock_watcher table does not exist!')
                return {
                    'exists': False,
                    'error': 'The stock_watcher table needs to be created in your Supabase database.'
                }
            
            if 'column' in error_msg.lower() and 'does not exist' in error_msg.lower():
                print(f'ERROR: Table schema issue: {error_msg}')
                return {
                    'exists': False,
                    'error': (
                        f'Table schema mismatch: {error_msg}. '
                        'Please check your table columns match: '
                        'id, user_id, ticker, stock_name, buy_price, buy_date'
                    )
                }
            
            print(f'ERROR: Other table error: {result.error}')
            return {'exists': False, 'error': error_msg}
        
        return {'exists': True, 'error': None}
    except Exception as err:
        print(f'ERROR: Error checking table: {err}')
        return {'exists': False, 'error': str(err)}


async def load_user_stocks(user_id: str) -> List[Dict[str, Any]]:
    """Load user's stocks from Supabase"""
    try:
        result = (
            supabase.table('stock_watcher')
            .select('*')
            .eq('user_id', user_id)
            .order('id', desc=True)
            .execute()
        )
        
        if hasattr(result, 'error') and result.error:
            print(f'ERROR: Error loading stocks: {result.error}')
            raise Exception('Failed to load stocks from database')
        
        data = result.data if hasattr(result, 'data') else []
        
        if not data or len(data) == 0:
            return []
        
        # Process stocks with current data
        import asyncio
        stocks_with_current_data = await asyncio.gather(*[
            _enrich_stock_data(stock) for stock in data
        ])
        
        return stocks_with_current_data
    except Exception as err:
        print(f'ERROR: Error loading user stocks: {err}')
        raise err


async def _enrich_stock_data(stock: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich stock data with current price and gain/loss calculations"""
    # Get current market price
    current_stock_data = await get_stock_data(stock['ticker'])
    
    # Check if buy date was on weekend and get appropriate price
    # Handle different date formats
    buy_date_str = stock['buy_date']
    if 'T' in buy_date_str:
        buy_date = datetime.fromisoformat(buy_date_str.replace('Z', '+00:00'))
    else:
        buy_date = datetime.strptime(buy_date_str, '%Y-%m-%d')
    buy_day_of_week = buy_date.weekday()
    effective_current_price = stock['buy_price']  # fallback
    
    if current_stock_data.get('success'):
        effective_current_price = current_stock_data.get('price', stock['buy_price'])
    
    # If bought on weekend, use Friday's price as the "current" price for that period
    if buy_day_of_week == 6 or buy_day_of_week == 5:  # Sunday (6) or Saturday (5)
        historical_data = await get_historical_stock_data(
            stock['ticker'],
            stock['buy_date']
        )
        if historical_data.get('success'):
            effective_current_price = historical_data.get('price', stock['buy_price'])
    
    gain_loss = effective_current_price - stock['buy_price']
    gain_loss_percent = round((gain_loss / stock['buy_price']) * 100, 2)
    
    return {
        'id': stock['id'],
        'symbol': stock['ticker'],
        'name': stock['stock_name'],
        'currentPrice': effective_current_price,
        'buyPrice': stock['buy_price'],
        'buyDate': stock['buy_date'],
        'gainLoss': gain_loss,
        'gainLossPercent': gain_loss_percent,
        'addedAt': 'N/A',
        'isWeekendBuy': buy_day_of_week == 6 or buy_day_of_week == 5
    }


async def save_stock_to_database(
    user_id: str,
    ticker: str,
    stock_name: str,
    buy_price: float,
    buy_date: str
) -> Dict[str, Any]:
    """Save new stock to Supabase"""
    try:
        result = (
            supabase.table('stock_watcher')
            .insert({
                'user_id': user_id,
                'ticker': ticker,
                'stock_name': stock_name,
                'buy_price': buy_price,
                'buy_date': buy_date
            })
            .execute()
        )
        
        if hasattr(result, 'error') and result.error:
            print(f'ERROR: Error saving stock: {result.error}')
            raise Exception('Failed to save stock to database')
        
        saved_data = result.data if hasattr(result, 'data') else []
        
        if not saved_data or len(saved_data) == 0:
            raise Exception('No data returned from database after insert')
        
        return saved_data[0]
    except Exception as err:
        print(f'ERROR: Error saving stock: {err}')
        raise err


async def remove_stock_from_database(stock_id: int) -> bool:
    """Remove stock from Supabase"""
    try:
        result = (
            supabase.table('stock_watcher')
            .delete()
            .eq('id', stock_id)
            .execute()
        )
        
        if hasattr(result, 'error') and result.error:
            print(f'ERROR: Error removing stock: {result.error}')
            raise Exception('Failed to remove stock from database')
        
        return True
    except Exception as err:
        print(f'ERROR: Error removing stock: {err}')
        raise err

