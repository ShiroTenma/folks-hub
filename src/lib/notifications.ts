import { supabase } from './supabase';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export const createNotification = async (title: string, message: string, type: NotificationType = 'info', userId?: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        { title, message, type, user_id: userId }
      ]);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
