import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle2, Wallet, CreditCard } from 'lucide-react';

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
    { title: 'Community Size', ...stats.members, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Task Pipeline', ...stats.tasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Net Capital', ...stats.balance, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Liquid Assets', ...stats.cashOnHand, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <Card key={i} className="rounded-3xl border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${item.bg} p-3 rounded-2xl`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{item.title}</p>
              <h3 className="text-2xl font-black text-slate-900">{item.value}</h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{item.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
