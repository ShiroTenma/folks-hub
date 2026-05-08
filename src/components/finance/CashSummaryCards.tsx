import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CashSummaryCardsProps {
  totals: {
    collected: number;
    target: number;
    pending: number;
  };
  memberCount: number;
}

export function CashSummaryCards({ totals, memberCount }: CashSummaryCardsProps) {
  const cards = [
    {
      label: 'Total Collected',
      value: `Rp ${totals.collected.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-[#1c1c1c]',
      bg: 'bg-white',
      accent: 'text-[#535366]',
      border: 'border-[#535366]/20'
    },
    {
      label: 'Target Revenue',
      value: `Rp ${totals.target.toLocaleString()}`,
      icon: CheckCircle2,
      color: 'text-[#1c1c1c]',
      bg: 'bg-white',
      accent: 'text-[#535366]',
      border: 'border-[#dcd7cf]'
    },
    {
      label: 'Pending Balance',
      value: `Rp ${totals.pending.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-white',
      accent: 'text-rose-200',
      border: 'border-rose-100'
    },
    {
      label: 'Tracked Members',
      value: memberCount.toString(),
      icon: Users,
      color: 'text-[#1c1c1c]',
      bg: 'bg-[#535366]',
      accent: 'text-white/20',
      border: 'border-white/10',
      inverse: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {cards.map((card, i) => (
        <Card 
          key={i} 
          className={cn(
            "relative group overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-[#1c1c1c]/5 hover:-translate-y-1",
            card.bg,
            card.border,
            card.inverse ? "text-white" : "text-[#1c1c1c]"
          )}
        >
          <card.icon className={cn("absolute -right-6 -bottom-6 h-32 w-32 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700", card.inverse ? "text-white" : "text-[#535366]")} />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-8">
              <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", card.inverse ? "text-white/40" : "text-[#535366]/60")}>
                {card.label}
              </span>
              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center border transition-colors", card.inverse ? "bg-white/10 border-white/20 text-white" : "bg-[#eae6e0]/50 border-[#dcd7cf] text-[#535366]")}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            
            <div>
              <p className={cn("text-3xl font-heading font-black tracking-tight", card.color)}>
                {card.value}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className={cn("h-1.5 w-12 rounded-full", card.inverse ? "bg-white/20" : "bg-[#535366]/10")}>
                  <div className={cn("h-full rounded-full transition-all duration-1000 w-2/3", card.inverse ? "bg-white" : "bg-[#535366]")} />
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest", card.inverse ? "text-white/30" : "text-[#535366]/40")}>Monthly Goal</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
