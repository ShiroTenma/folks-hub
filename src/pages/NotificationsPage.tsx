import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, Trash2, Info, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (err: any) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
      fetchNotifications();
      toast.success('All marked as read');
    } catch (err) {
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
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 text-sm">Stay updated with the latest organizational activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={markAllRead}
            disabled={notifications.filter(n => !n.read).length === 0}
            className="rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest h-10 px-4"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-500" />
              Recent Alerts
            </CardTitle>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold">
              {notifications.filter(n => !n.read).length} New
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Loading Alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Bell className="h-12 w-12 opacity-10" />
              <p className="text-sm font-medium italic">No notifications to show</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {paginatedNotifications.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors group",
                      !notif.read && "bg-indigo-50/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      notif.type === 'info' ? "bg-blue-50 text-blue-600" :
                      notif.type === 'warning' ? "bg-amber-50 text-amber-600" :
                      notif.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                      "bg-rose-50 text-rose-600"
                    )}>
                      {notif.type === 'info' ? <Info className="h-5 w-5" /> :
                       notif.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                       <Check className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                          "text-sm font-bold leading-tight",
                          notif.read ? "text-slate-700" : "text-slate-900"
                        )}>
                          {notif.title}
                          {!notif.read && <span className="ml-2 w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block mb-0.5"></span>}
                        </h4>
                        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-all h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Showing {Math.min(notifications.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(notifications.length, currentPage * ITEMS_PER_PAGE)} of {notifications.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-white"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (totalPages <= 5 || (page >= currentPage - 1 && page <= currentPage + 1) || page === 1 || page === totalPages) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "h-9 w-9 rounded-xl font-bold text-[10px]",
                                currentPage === page ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-200 bg-white"
                              )}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-white"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
