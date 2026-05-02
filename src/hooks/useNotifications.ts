import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return {
    notifications,
    isLoading,
    markAllRead,
    deleteNotification,
    refresh: fetchNotifications
  };
}
