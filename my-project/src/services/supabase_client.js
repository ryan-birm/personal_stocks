import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('MISSING SUPABASE ENVIRONMENT VARIABLES');
  console.error('Missing:', { url: !supabaseUrl, key: !supabaseAnonKey });
  console.error('Create a .env file in the project root with:');
  console.error('VITE_SUPABASE_URL=your_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_key');
}

// Use fallback values to prevent crash (app won't work but won't crash)
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey, {
  global: {
    fetch: async (...args) => {
      const [url, options = {}] = args;
      try {
        console.log('Supabase Request:', {
          url: url.toString(),
          method: options.method || 'GET',
        });
        const response = await fetch(url, options);
        if (!response.ok) {
          // Try to get error details from response body
          let errorBody = null;
          try {
            const clonedResponse = response.clone();
            errorBody = await clonedResponse.json();
          } catch (e) {
            // If we can't parse JSON, that's okay
          }
          console.error('Supabase Request Failed:', {
            status: response.status,
            statusText: response.statusText,
            url: url.toString(),
            errorBody: errorBody
          });
        }
        return response;
      } catch (error) {
        console.error('Supabase Fetch Error:', error);
        throw error;
      }
    },
  },
});

