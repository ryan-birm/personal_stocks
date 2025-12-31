from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')

# Log environment variables (without exposing the full key for security)
print('Supabase Config:', {
    'url': f'{supabase_url[:20]}...' if supabase_url else 'MISSING',
    'hasKey': bool(supabase_anon_key)
})

# Provide fallback values to prevent crashes when env vars are missing
safe_url = supabase_url or 'https://placeholder.supabase.co'
safe_key = supabase_anon_key or 'placeholder-key'

if not supabase_url or not supabase_anon_key:
    print('ERROR: MISSING SUPABASE ENVIRONMENT VARIABLES! App will not work properly.')
    print('Missing:', {'url': not supabase_url, 'key': not supabase_anon_key})

# Create Supabase client
supabase_server = create_client(safe_url, safe_key)

