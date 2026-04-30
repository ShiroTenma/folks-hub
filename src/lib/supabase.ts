import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  student_id: string;
  division: string;
  batch: string;
  role: 'super_admin' | 'bph' | 'division_leader' | 'member' | 'advisor';
  status: 'active' | 'inactive';
  contact: string;
  avatar_url?: string;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  division: string;
  pic_id?: string;
  deadline?: string;
  progress_percent: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};
