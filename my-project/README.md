# Stock Portfolio App

React frontend + Python FastAPI backend

## Quick Start

**Frontend:**
```bash
npm install
npm run dev  # Runs on http://localhost:5173
```

**Backend:**
```bash
cd src/backend
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8000
```

## Environment Variables

**Frontend** (`.env`):
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_API_BASE_URL=http://localhost:8000
```

**Backend** (`src/backend/.env`):
```
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
POLYGON_API_KEY=your_key
ALLOWED_ORIGINS=http://localhost:5173
```

## Structure

- `src/` - React frontend (components, pages, services)
- `src/backend/` - Python FastAPI backend
- `src/services/api.js` - Frontend API client (calls backend)
- `src/services/supabase_client.js` - Auth client

## Deploy to Render

See `DEPLOYMENT.md` for details.
