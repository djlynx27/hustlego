import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Support both key naming conventions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  '';

// Safe client: returns a no-op client when env vars are missing (avoids crash at module load time)
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage:
            typeof localStorage !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : createClient<Database>(
        'https://placeholder.supabase.co',
        'placeholder-anon-key'
      );
