import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Landmark, CreditCard, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiquidityHeaderProps {
  totalBalance: number;
  sourceBalances: Record<string, number>;
}

/**
 * Real-time Liquidity Header for the Financial Ledger.
 * Provides a high-impact visualization of organizational capital across all payment sources.
 * Designed for immediate institutional transparency.
 */
export function LiquidityHeader({ totalBalance, sourceBalances }: LiquidityHeaderProps) {
  const sources = [
    { label: 'BNI (Bank)', icon: Landmark, key: 'BNI' },
    { label: 'DANA (Digital)', icon: CreditCard, key: 'DANA' },
    { label: 'Cash on Hand', icon: Wallet, key: 'Cash' },
  ];

  return (
    <div className="bg-[#1c1c1c] rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-black/20">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <ArrowUpRight className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Real-time Liquidity</span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]">Consolidated Capital</p>
            <h2 className="text-6xl font-heading font-black tracking-tighter italic">
              Rp {totalBalance.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sources.map((source) => (
            <div key={source.key} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#1c1c1c] transition-all duration-500">
                  <source.icon className="h-5 w-5" />
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{source.label}</p>
                <p className="text-sm font-bold truncate">Rp {(sourceBalances[source.key] || 0).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
