import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  useDocumentTitle('Notifications');
  const { notifications, isLoading, markAllRead, deleteNotification } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = notifications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1c1c] tracking-tight">Notifications</h1>
          <p className="text-[#535366]/60 text-sm font-medium">Stay updated with organizational activities.</p>
        </div>
        <Button 
          variant="outline" onClick={markAllRead} disabled={unreadCount === 0}
          className="rounded-xl border-[#dcd7cf] text-xs font-bold uppercase tracking-widest h-10 px-4"
        >
          <Check className="h-4 w-4 mr-2" /> Mark all as read
        </Button>
      </div>

      <Card className="rounded-3xl border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white">
        <CardHeader className="pb-3 border-b-2 border-[#dcd7cf] bg-[#f4f2ef]/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-[#1c1c1c] flex items-center gap-2">
              <Bell className="h-4 w-4" /> Recent Alerts
            </CardTitle>
            <Badge className="bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/90 border-none font-bold rounded-lg">{unreadCount} New</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#535366]/40">
              <div className="w-10 h-10 border-4 border-[#1c1c1c]/10 border-t-[#1c1c1c] rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#535366]/40 gap-4">
              <Bell className="h-12 w-12 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">No notifications to show</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#dcd7cf]/50">
                {paginatedNotifications.map((notif, i) => (
                  <NotificationItem key={notif.id} notif={notif} index={i} onDelete={deleteNotification} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-[#dcd7cf]/50 bg-[#f4f2ef]/30 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#535366]/40">
                    {Math.min(notifications.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(notifications.length, currentPage * ITEMS_PER_PAGE)} of {notifications.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold text-[10px]" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Prev</Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        (totalPages <= 5 || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1) || i === 0 || i === totalPages - 1) && (
                          <Button 
                            key={i} size="sm" onClick={() => setCurrentPage(i + 1)}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            className={cn("h-9 w-9 rounded-xl font-bold text-[10px]", currentPage === i + 1 ? "bg-[#1c1c1c] text-white" : "bg-white text-[#1c1c1c]")}
                          >
                            {i + 1}
                          </Button>
                        )
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold text-[10px]" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
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
