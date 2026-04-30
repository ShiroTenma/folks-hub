export type RoleId = 'super_admin' | 'admin' | 'member' | 'advisor';

export type Profile = {
  id: string;
  full_name: string;
  student_id: string;
  division: string;
  batch: string;
  role: RoleId;
  status: 'active' | 'inactive';
  contact: string;
  avatar_url?: string;
  created_at: string;
};

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  division: string;
  pic_id?: string;
  deadline?: string;
  progress_percent: number;
  tags?: string[];
  created_at: string;
};

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  event_type?: string;
  item_name?: string;
  debt_amount?: number;
  credit_amount?: number;
  division_target?: string;
  from_entity?: string;
  to_entity?: string;
  location?: string;
  payment_type?: string;
  receipt_url?: string;
  notes?: string;
};

export type MonthlyPayment = {
  id: string;
  profile_id: string;
  month: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  proof_url?: string;
  notes?: string;
  created_at: string;
};
