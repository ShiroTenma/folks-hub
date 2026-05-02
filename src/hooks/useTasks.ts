import { useState, useEffect, useCallback } from 'react';
import { supabase, type Task, type Profile } from '@/lib/supabase';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksRes, profilesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setTasks(tasksRes.data || []);
      
      const profileMap = (profilesRes.data || []).reduce((acc, p) => ({
        ...acc,
        [p.id]: p
      }), {});
      setProfiles(profileMap);
    } catch (err: any) {
      console.error('Fetch Tasks Error:', err);
      toast.error('Failed to load task board: ' + (err.message || 'Check connection'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const tasksChannel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [fetchData]);

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus, title: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw error;
      
      toast.success(`Task moved to ${status.replace('_', ' ')}`);
      const statusEmoji = status === 'done' ? '✅' : status === 'in_progress' ? '🚧' : '⏳';
      await createNotification(
        'Task Status Updated', 
        `${statusEmoji} "${title}" moved to ${status.replace('_', ' ')}.`, 
        status === 'done' ? 'success' : 'info'
      );
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Update Task Status Error:', err);
      toast.error('Failed to update status: ' + (err.message || 'Check connection'));
      return false;
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return false;
    
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      await createNotification('Task Deleted', `🗑️ Task "${title}" has been removed from the board.`, 'warning');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Delete Task Error:', err);
      toast.error('Failed to delete task: ' + (err.message || 'Check connection'));
      return false;
    }
  };

  const handleSaveTask = async (formData: any, editingId?: string) => {
    const pic_id = formData.pic_id === 'unassigned' ? null : formData.pic_id;
    const dataToSubmit = { ...formData, pic_id };
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('tasks')
          .update(dataToSubmit)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Task updated successfully');
        await createNotification('Task Updated', `Details for task "${formData.title}" have been modified.`, 'info');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([dataToSubmit]);
        if (error) throw error;
        toast.success('Task created successfully');
        await createNotification('New Task Created', `🚀 "${formData.title}" has been added to ${formData.division} board.`, 'success');
      }
      
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Submit Task Error:', err);
      toast.error('Error saving task: ' + (err.message || 'Check connection'));
      return false;
    }
  };

  return {
    tasks,
    profiles,
    isLoading,
    fetchData,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleSaveTask
  };
}
