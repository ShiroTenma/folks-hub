import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, CheckCircle2, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceSummaryCardsProps {
  totalBalance: number;
  paymentTypes: string[];
  getSourceBalance: (source: string) => number;
}

export function FinanceSummaryCards({
  totalBalance, paymentTypes, getSourceBalance
}: FinanceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-[#1c1c1c] text-white overflow-hidden relative group p-8 min-h-[180px] flex flex-col justify-between">
        <div className="absolute -right-8 -top-8 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-125">
          <PieChart className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Consolidated Net</span>
            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-lg">
              <Sparkles className="h-4 w-4 text-[#535366]" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black italic tracking-tight">Rp {totalBalance.toLocaleString()}</p>
        </div>
        <div className="relative z-10 mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#535366] bg-[#535366]/10 w-fit px-3 py-1.5 rounded-xl border border-[#535366]/20">
          <CheckCircle2 className="h-3 w-3" />
          Verified Assets
        </div>
      </Card>

      {paymentTypes.slice(0, 3).map((source, i) => {
        const bal = getSourceBalance(source);
        return (
          <Card key={source} className="rounded-[2.5rem] border-[#dcd7cf] shadow-2xl shadow-black/5 bg-white overflow-hidden relative group p-8 min-h-[180px] flex flex-col justify-between hover:border-[#535366] transition-all duration-500">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">{source} Account</span>
                <div className="h-8 w-8 rounded-xl bg-[#f4f2ef] flex items-center justify-center border border-[#dcd7cf] text-[#535366]">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <p className={cn("text-2xl font-serif font-black italic tracking-tight", bal < 0 ? "text-rose-600" : "text-[#1c1c1c]")}>
                Rp {bal.toLocaleString()}
              </p>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#535366] bg-[#eae6e0] w-fit px-3 py-1.5 rounded-xl border border-[#dcd7cf]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#535366] animate-pulse" />
              Liquid Funds
            </div>
          </Card>
        );
      })}
    </div>
  );
}
