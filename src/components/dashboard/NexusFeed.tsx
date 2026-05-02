import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  UserPlus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  CircleDashed,
  CreditCard,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface NexusItem {
  id: string;
  type: 'member' | 'payment' | 'task' | 'split_bill';
  title: string;
  subtitle: string;
  timestamp: string;
  status?: string;
}

/**
 * The Nexus Feed — Institutional Real-time Activity Stream.
 * Synchronizes the latest events across members, finance, and tasks.
 * Optimized for institutional focus and low latency.
 */
export function NexusFeed() {
  const [items, setItems] = useState<NexusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNexusData = async () => {
      try {
        // Fetch latest activities from different tables
        const [membersRes, paymentsRes, tasksRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('monthly_cash').select('id, profile_id, month, status, created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(3),
          supabase.from('tasks').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(3)
        ]);

        const allItems: NexusItem[] = [
          ...(membersRes.data || []).map(m => ({
            id: m.id,
            type: 'member' as const,
            title: m.full_name,
            subtitle: 'New Registry Entry',
            timestamp: m.created_at
          })),
          ...(paymentsRes.data || []).map(p => ({
            id: p.id,
            type: 'payment' as const,
            title: (p.profiles as any)?.full_name || 'Personnel',
            subtitle: `Synchronized ${p.month} Record`,
            status: p.status,
            timestamp: p.created_at
          })),
          ...(tasksRes.data || []).map(t => ({
            id: t.id,
            type: 'task' as const,
            title: t.title,
            subtitle: `Strategy Update: ${t.status.replace('_', ' ')}`,
            timestamp: t.updated_at
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

        setItems(allItems);
      } catch (error) {
        console.error('Nexus Sync Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNexusData();
    
    // Subscribe to real-time changes
    const profileSub = supabase.channel('nexus_profiles').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, fetchNexusData).subscribe();
    const cashSub = supabase.channel('nexus_cash').on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_cash' }, fetchNexusData).subscribe();
    const taskSub = supabase.channel('nexus_tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchNexusData).subscribe();

    return () => {
      profileSub.unsubscribe();
      cashSub.unsubscribe();
      taskSub.unsubscribe();
    };
  }, []);

  const getIcon = (type: NexusItem['type'], status?: string) => {
    switch (type) {
      case 'member': return <UserPlus className="h-4 w-4 text-[#1c1c1c]" />;
      case 'payment': 
        if (status === 'approved') return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
        return <CircleDashed className="h-4 w-4 text-amber-500" />;
      case 'task': return <CheckCircle2 className="h-4 w-4 text-[#535366]" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    
    if (diff < 60) return 'Just Now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-[#f4f2ef]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-[#f4f2ef] rounded" />
                    <div className="h-2 w-1/3 bg-[#f4f2ef] rounded opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-10 gap-3">
              <History className="h-10 w-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Synchronized activity</p>
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-4 group"
              >
                <div className="mt-1 relative">
                  <div className="h-10 w-10 rounded-xl bg-[#f4f2ef] flex items-center justify-center border border-[#dcd7cf] group-hover:border-[#1c1c1c] transition-all duration-300">
                    {getIcon(item.type, item.status)}
                  </div>
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-white rounded-full flex items-center justify-center border border-[#dcd7cf]">
                    <div className="h-1 w-1 bg-[#1c1c1c] rounded-full" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[13px] font-bold text-[#1c1c1c] truncate">{item.title}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#535366]/40 whitespace-nowrap">{formatTime(item.timestamp)}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#535366]/40 truncate">{item.subtitle}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
