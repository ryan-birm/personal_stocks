"""
Stock API service for fetching real-time stock data using Polygon.io API
"""
import os
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

POLYGON_API_KEY = os.getenv('POLYGON_API_KEY')
POLYGON_BASE_URL = os.getenv('POLYGON_BASE_URL', 'https://api.polygon.io')


def format_date(date: datetime) -> str:
    """Format datetime to YYYY-MM-DD string"""
    return date.strftime('%Y-%m-%d')


def get_last_trading_day(date: datetime) -> datetime:
    """Get the last trading day (adjusts weekends to Friday)"""
    day = date
    day_of_week = day.weekday()  # 0 = Monday, 6 = Sunday
    
    if day_of_week == 6:  # Sunday
        day = day - timedelta(days=2)  # Go back to Friday
    elif day_of_week == 5:  # Saturday
        day = day - timedelta(days=1)  # Go back to Friday
    
    return day


async def get_stock_data(
    ticker: str,
    chart_days: int = 30,
    historical_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Comprehensive stock data fetcher - combines all stock API methods into one call
    Fetches current price, historical data, chart data, and company info in parallel
    
    Args:
        ticker: Stock ticker symbol
        chart_days: Number of days for chart data (default: 30)
        historical_date: Date string for historical price lookup (optional)
    
    Returns:
        Complete stock data object
    """
    ticker_upper = ticker.upper()
    
    try:
        end_date = format_date(datetime.now())
        start_date = format_date(
            datetime.now() - timedelta(days=max(chart_days, 5))
        )
        
        # Prepare all API calls
        async with httpx.AsyncClient() as client:
            # Prepare API call coroutines
            api_calls = []
            
            # Current price data (last 5 days for comparison)
            price_url = (
                f"{POLYGON_BASE_URL}/v2/aggs/ticker/{ticker_upper}/range/1/day/"
                f"{start_date}/{end_date}?adjusted=true&sort=desc&limit=5"
                f"&apikey={POLYGON_API_KEY}"
            )
            api_calls.append(client.get(price_url))
            
            # Company/ticker details
            ticker_url = (
                f"{POLYGON_BASE_URL}/v3/reference/tickers/{ticker_upper}"
                f"?apikey={POLYGON_API_KEY}"
            )
            api_calls.append(client.get(ticker_url))
            
            # Chart data (if chartDays specified)
            if chart_days > 0:
                chart_url = (
                    f"{POLYGON_BASE_URL}/v2/aggs/ticker/{ticker_upper}/range/1/day/"
                    f"{start_date}/{end_date}?adjusted=true&sort=asc&limit=120"
                    f"&apikey={POLYGON_API_KEY}"
                )
                api_calls.append(client.get(chart_url))
            
            # Historical data (if date specified)
            if historical_date:
                target_date = datetime.strptime(historical_date, '%Y-%m-%d')
                last_trading_day = get_last_trading_day(target_date)
                hist_end_date = format_date(last_trading_day)
                hist_start_date = format_date(
                    last_trading_day - timedelta(days=7)
                )
                hist_url = (
                    f"{POLYGON_BASE_URL}/v2/aggs/ticker/{ticker_upper}/range/1/day/"
                    f"{hist_start_date}/{hist_end_date}?adjusted=true&sort=desc&limit=5"
                    f"&apikey={POLYGON_API_KEY}"
                )
                api_calls.append(client.get(hist_url))
            
            # Execute all calls in parallel
            responses = await asyncio.gather(*api_calls, return_exceptions=True)
            
            # Process responses - map to correct indices
            price_res = responses[0] if len(responses) > 0 and not isinstance(responses[0], Exception) else None
            ticker_res = responses[1] if len(responses) > 1 and not isinstance(responses[1], Exception) else None
            chart_res = responses[2] if len(responses) > 2 and not isinstance(responses[2], Exception) and chart_days > 0 else None
            historical_res = responses[-1] if historical_date and len(responses) > 2 and not isinstance(responses[-1], Exception) else None
        
        # Parse current price data
        current_price = None
        previous_close = None
        change = None
        change_percent = 0
        volume = None
        high = None
        low = None
        open_price = None
        
        if price_res and price_res.status_code == 200:
            price_data = price_res.json()
            if price_data.get('results') and len(price_data['results']) > 0:
                latest_data = price_data['results'][0]
                previous_data = price_data['results'][1] if len(price_data['results']) > 1 else latest_data
                
                current_price = latest_data.get('c')
                previous_close = previous_data.get('c')
                open_price = latest_data.get('o')
                high = latest_data.get('h')
                low = latest_data.get('l')
                volume = latest_data.get('v')
                
                if previous_close and current_price and previous_data != latest_data:
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100
                elif open_price and current_price:
                    change = current_price - open_price
                    change_percent = (change / open_price) * 100
        
        if not current_price:
            raise ValueError(f'No data found for ticker "{ticker_upper}". Please check the symbol.')
        
        # Parse company/ticker details
        company_name = ticker_upper
        description = ''
        market = ''
        primary_exchange = ''
        currency = 'USD'
        locale = 'us'
        
        if ticker_res and ticker_res.status_code == 200:
            ticker_data = ticker_res.json()
            if ticker_data.get('results'):
                result = ticker_data['results']
                company_name = result.get('name', company_name)
                description = result.get('description', '')
                market = result.get('market', '')
                primary_exchange = result.get('primary_exchange', '')
                currency = result.get('currency_name', 'USD')
                locale = result.get('locale', 'us')
        
        # Parse chart data
        chart_data = []
        if chart_res and chart_res.status_code == 200:
            chart_json = chart_res.json()
            if chart_json.get('results') and len(chart_json['results']) > 0:
                chart_data = [
                    {
                        'date': datetime.fromtimestamp(result['t'] / 1000),
                        'open': result['o'],
                        'close': result['c'],
                        'high': result['h'],
                        'low': result['l'],
                        'volume': result['v']
                    }
                    for result in chart_json['results']
                ]
        
        # Parse historical data
        historical_price = None
        if historical_res and historical_res.status_code == 200:
            historical_json = historical_res.json()
            if historical_json.get('results') and len(historical_json['results']) > 0:
                historical_price = historical_json['results'][0].get('c')
        
        return {
            'success': True,
            'ticker': ticker_upper,
            # Current price data
            'price': current_price,
            'currentPrice': current_price,
            'previousClose': previous_close,
            'change': change,
            'changePercent': change_percent,
            'open': open_price,
            'high': high,
            'low': low,
            'volume': volume,
            # Company info
            'companyName': company_name,
            'description': description,
            'market': market,
            'primaryExchange': primary_exchange,
            'currency': currency,
            'locale': locale,
            # Chart data
            'chartData': chart_data,
            # Historical data
            'historicalPrice': historical_price,
            'historicalDate': historical_date
        }
    except Exception as error:
        print(f'Error fetching stock data: {error}')
        return {
            'success': False,
            'error': str(error),
            'ticker': ticker_upper
        }


# Legacy function wrappers for backward compatibility
async def get_historical_stock_data(ticker: str, buy_date: str) -> Dict[str, Any]:
    """Get historical stock price for a specific date"""
    result = await get_stock_data(ticker, chart_days=0, historical_date=buy_date)
    if result.get('success') and result.get('historicalPrice'):
        return {'price': result['historicalPrice'], 'success': True}
    return {'success': False, 'error': result.get('error', 'No historical data available')}


async def get_stock_chart_data(ticker: str, days: int) -> Dict[str, Any]:
    """Get stock chart data for specified number of days"""
    result = await get_stock_data(ticker, chart_days=days)
    if result.get('success') and result.get('chartData'):
        return {
            'success': True,
            'data': result['chartData'],
            'ticker': result['ticker'],
            'period': f'{days} days'
        }
    return {
        'success': False,
        'error': result.get('error', 'No chart data available')
    }


async def get_stock_full_info(ticker: str) -> Dict[str, Any]:
    """Get full stock information without chart data"""
    return await get_stock_data(ticker, chart_days=0)

