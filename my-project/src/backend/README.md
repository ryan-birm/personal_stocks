# Backend API

Python FastAPI server

## Setup

```bash
pip install -r requirements.txt
python main.py
```

## Environment Variables

```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
POLYGON_API_KEY=your_key
ALLOWED_ORIGINS=http://localhost:5173
PORT=8000
```

## API Endpoints

- `POST /api/stocks/data` - Get stock data
- `GET /api/stocks/{ticker}/chart` - Get chart data
- `GET /api/user/stocks` - Get user stocks
- `POST /api/user/stocks` - Save stock
- `DELETE /api/user/stocks/{id}` - Delete stock
