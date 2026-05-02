import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, CheckCircle2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceSummaryCardsProps {
  totalBalance: number;
  paymentTypes: string[];
  getSourceBalance: (source: string) => number;
}

export function FinanceSummaryCards({
  totalBalance,
  paymentTypes,
  getSourceBalance
}: FinanceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="rounded-3xl border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PieChart className="h-16 w-16" />
        </div>
        <CardContent className="p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Net Balance</p>
          <p className="text-2xl font-black">Rp {totalBalance.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Verified Assets
          </div>
        </CardContent>
      </Card>

      {paymentTypes.map(source => {
        const bal = getSourceBalance(source);
        return (
          <Card key={source} className="rounded-3xl border-none shadow-lg bg-white overflow-hidden relative group">
            <CardContent className="p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{source} Balance</p>
              <p className={cn("text-xl font-black", bal < 0 ? "text-rose-600" : "text-slate-900")}>
                Rp {bal.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-full">
                <CreditCard className="h-3 w-3" />
                Liquid Funds
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
