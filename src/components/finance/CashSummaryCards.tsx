import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface CashSummaryCardsProps {
  totals: {
    collected: number;
    target: number;
    pending: number;
  };
  memberCount: number;
}

export function CashSummaryCards({ totals, memberCount }: CashSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="rounded-2xl border-none shadow-lg bg-slate-900 text-white p-6 relative group overflow-hidden">
        <CheckCircle2 className="absolute -right-4 -top-4 h-24 w-24 opacity-5 group-hover:opacity-10 transition-opacity" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Collected</p>
        <p className="text-3xl font-black text-indigo-400">Rp {totals.collected.toLocaleString()}</p>
      </Card>
      <Card className="rounded-2xl border-none shadow-lg bg-white p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Target Revenue</p>
        <p className="text-3xl font-black text-slate-900">Rp {totals.target.toLocaleString()}</p>
      </Card>
      <Card className="rounded-2xl border-none shadow-lg bg-white p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Pending Balance</p>
        <p className="text-3xl font-black text-rose-500">Rp {totals.pending.toLocaleString()}</p>
      </Card>
      <Card className="rounded-2xl border-none shadow-lg bg-white p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Tracked Members</p>
        <p className="text-3xl font-black text-emerald-600">{memberCount}</p>
      </Card>
    </div>
  );
}
