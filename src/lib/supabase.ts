import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/index'; // Assuming we might add Generated types later
import type { Profile, Task, Transaction } from '@/types/index';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { Profile, Task, Transaction };

