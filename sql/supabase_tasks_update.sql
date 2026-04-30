-- Add tags column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Optional: If you want to categorize by Proker specifically
-- ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'task'; -- 'task' or 'proker'
