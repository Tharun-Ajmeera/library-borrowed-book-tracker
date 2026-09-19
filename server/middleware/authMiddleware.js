import { supabasePublic, getScopedSupabase } from '../config/supabase.js';

/**
 * Authentication middleware that verifies Supabase JWT bearer tokens.
 * Attaches the user object and scoped Supabase client to `req`.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization token format'
      });
    }

    // Verify token with Supabase Auth using the validated client
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      console.warn('Supabase token verification failed:', error?.message || 'No user found');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please log in again.'
      });
    }

    // Attach authenticated staff information to the request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      user_metadata: user.user_metadata || {}
    };
    req.token = token;

    // Attach scoped Supabase client that inherits the user's JWT
    // This strictly enforces Supabase PostgreSQL Row Level Security (RLS) policies
    req.supabase = getScopedSupabase(token);

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication service encountered an unexpected error.'
    });
  }
};
