import React from 'react';
import { Trash2, Info, AlertTriangle, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notif: any;
  index: number;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notif, index, onDelete }: NotificationItemProps) {
  const Icon = notif.type === 'info' ? Info : (notif.type === 'warning' ? AlertTriangle : Check);
  const colorClass = notif.type === 'info' ? "bg-blue-50 text-blue-600" :
                    notif.type === 'warning' ? "bg-amber-50 text-amber-600" :
                    notif.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                    "bg-rose-50 text-rose-600";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-6 flex items-start gap-4 hover:bg-[#f4f2ef]/50/50 transition-colors group",
        !notif.read && "bg-[#f4f2ef]/50"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={cn("text-sm font-bold leading-tight", notif.read ? "text-[#535366]" : "text-[#1c1c1c]")}>
            {notif.title}
            {!notif.read && <span className="ml-2 w-1.5 h-1.5 bg-[#1c1c1c] rounded-full inline-block mb-0.5"></span>}
          </h4>
          <div className="flex items-center gap-1.5 text-[#535366]/40 shrink-0">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#535366]/60 font-medium leading-relaxed">{notif.message}</p>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(notif.id)}
        className="opacity-0 group-hover:opacity-100 text-[#535366]/30 hover:text-rose-600 transition-all h-8 w-8 rounded-lg"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
