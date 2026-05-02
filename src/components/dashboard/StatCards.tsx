import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle2, Wallet, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardsProps {
  stats: {
    members: { value: string; sub: string };
    tasks: { value: string; sub: string };
    balance: { value: string; sub: string };
    cashOnHand: { value: string; sub: string };
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const items = [
    { title: 'Community Size', ...stats.members, icon: Users, color: 'text-[#1c1c1c]', bg: 'bg-white', accent: 'text-[#535366]' },
    { title: 'Execution Rate', ...stats.tasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-white', accent: 'text-emerald-100' },
    { title: 'Consolidated Net', ...stats.balance, icon: Wallet, color: 'text-[#1c1c1c]', bg: 'bg-[#1c1c1c]', accent: 'text-white/20', inverse: true },
    { title: 'Liquid Assets', ...stats.cashOnHand, icon: CreditCard, color: 'text-rose-600', bg: 'bg-white', accent: 'text-rose-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {items.map((item, i) => (
        <Card key={i} className={cn(
          "rounded-[2.5rem] border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden group hover:-translate-y-1 transition-all duration-500 premium-shadow p-8 min-h-[220px] flex flex-col justify-between relative",
          item.bg,
          item.inverse ? "text-white border-none" : "text-[#1c1c1c]"
        )}>
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-125 pointer-events-none">
            <item.icon className="h-40 w-40" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", item.inverse ? "text-white/40" : "text-[#535366]/40")}>{item.title}</span>
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border transition-all", item.inverse ? "bg-white/10 border-white/20 text-white" : "bg-[#f4f2ef] border-[#dcd7cf] text-[#535366]")}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            
            <h3 className={cn("text-3xl font-serif font-black italic tracking-tight", item.inverse ? "text-white" : item.color)}>
              {item.value}
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <div className={cn("h-1.5 w-8 rounded-full", item.inverse ? "bg-white/20" : "bg-[#535366]/10")}>
                <div className={cn("h-full rounded-full transition-all duration-1000 w-2/3", item.inverse ? "bg-white" : "bg-[#535366]")} />
              </div>
              <p className={cn("text-[9px] font-black uppercase tracking-widest", item.inverse ? "text-white/30" : "text-[#535366]/40")}>{item.sub}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
