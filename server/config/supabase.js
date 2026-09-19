import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL || '';
// Clean trailing slashes or accidentally included /rest/v1 paths
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Validate service role key: must not be placeholder and should look like a valid JWT
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const isValidServiceKey =
  rawServiceKey &&
  rawServiceKey !== 'your-supabase-service-role-key' &&
  rawServiceKey !== 'your_server_only_service_role_key' &&
  rawServiceKey.startsWith('eyJ');

export const supabaseServiceKey = isValidServiceKey ? rawServiceKey : supabaseAnonKey;

if (!supabaseUrl) {
  console.warn('⚠️ SUPABASE_URL is not defined in environment variables. Please check your .env file.');
}

/**
 * Administrative Supabase client using the service role key (or fallback to anon key).
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Public/Anon Supabase client for general operations and token verification.
 */
export const supabasePublic = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Creates an authenticated Supabase client scoped to the user's access token.
 * This guarantees PostgreSQL Row Level Security (RLS) is strictly enforced for the user.
 * @param {string} token - User's Supabase JWT access token
 */
export const getScopedSupabase = (token) => {
  if (!token) {
    return supabasePublic;
  }
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
