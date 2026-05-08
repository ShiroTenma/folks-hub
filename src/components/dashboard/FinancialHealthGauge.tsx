import React from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialHealthGaugeProps {
  collected: number;
  target: number;
  isLoading?: boolean;
}

/**
 * Premium Financial Health Gauge for the Executive Dashboard.
 * Visualizes collection progress vs. institutional targets.
 * Features a high-contrast circular progress indicator.
 */
export function FinancialHealthGauge({ collected, target, isLoading }: FinancialHealthGaugeProps) {
  const safeCollected = collected || 0;
  const safeTarget = target || 0;
  const percentage = safeTarget > 0 ? Math.min(Math.round((safeCollected / safeTarget) * 100), 100) : 0;
  const strokeDasharray = 251.2; // 2 * PI * 40
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div className="bg-white rounded-[2.5rem] border-2 border-[#dcd7cf] p-8 shadow-2xl shadow-black/5 flex flex-col md:flex-row items-center gap-8 group hover:border-[#1c1c1c] transition-all duration-500">
      <div className="relative h-32 w-32 shrink-0">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50" cy="50" r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            className="text-[#f4f2ef]"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="50" cy="50" r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: strokeDasharray }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn(
              "transition-all duration-500",
              percentage >= 80 ? "text-emerald-500" : percentage >= 40 ? "text-amber-500" : "text-rose-500"
            )}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-heading font-black tracking-tighter text-[#1c1c1c]">{isLoading ? '..' : `${percentage}%`}</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">Status</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 text-center md:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Target className="h-3 w-3 text-[#535366]/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Institutional Collection</h3>
          </div>
          <p className="text-2xl font-heading font-black text-[#1c1c1c] tracking-tight italic">
            Financial <span className="text-[#535366] not-italic">Health Status</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#f4f2ef]/50 p-4 rounded-2xl border border-[#dcd7cf]/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-[#535366]/60">Collected</span>
            </div>
            <p className="text-xs font-black text-[#1c1c1c]">Rp {(collected || 0).toLocaleString()}</p>
          </div>
          <div className="bg-[#f4f2ef]/50 p-4 rounded-2xl border border-[#dcd7cf]/50">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-3 w-3 text-[#535366]/40" />
              <span className="text-[8px] font-black uppercase tracking-widest text-[#535366]/60">Target</span>
            </div>
            <p className="text-xs font-black text-[#1c1c1c]">Rp {(target || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
