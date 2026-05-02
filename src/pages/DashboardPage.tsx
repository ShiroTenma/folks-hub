import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Plus,
  BarChart3,
  Filter,
  Download,
  Clock,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDashboard } from '@/hooks/useDashboard';
import { StatCards } from '@/components/dashboard/StatCards';
import { FinanceCharts } from '@/components/dashboard/FinanceCharts';
import { ActivityOverview } from '@/components/dashboard/ActivityOverview';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { profile } = useAuthStore();
  
  // Filters
  const [selectedMonth, setSelectedMonth] = React.useState<string>((new Date().getMonth()).toString());
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());

  const {
    isLoading,
    stats,
    financeMetrics,
    divisionProgress,
    upcomingAgenda
  } = useDashboard(selectedMonth, selectedYear);

  const formatIDR = (val: number) => {
    if (val >= 1000000) return `Rp ${(val/1000000).toFixed(1)}M`;
    if (val >= 1000) return `Rp ${(val/1000).toFixed(0)}K`;
    return `Rp ${val}`;
  };

  const handleExport = () => {
    const data = {
      period: `${MONTHS[parseInt(selectedMonth)]} ${selectedYear}`,
      stats,
      metrics: financeMetrics
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_summary_${selectedMonth}_${selectedYear}.json`;
    link.click();
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-indigo-600 rounded-full" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] pl-4">Institutional Oversight & Strategy</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 pl-4 pr-2 border-r border-slate-100 hidden sm:flex">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeframe</span>
          </div>
          
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px] rounded-2xl border-none bg-slate-50 h-10 text-[10px] font-black uppercase tracking-widest focus:ring-0">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              {MONTHS.map((m, i) => <SelectItem key={i} value={i.toString()} className="text-[10px] font-bold uppercase">{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] rounded-2xl border-none bg-slate-50 h-10 text-[10px] font-black uppercase tracking-widest focus:ring-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y} className="text-[10px] font-bold uppercase">{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <StatCards stats={stats} />

      <FinanceCharts 
        incomeVsExpense={financeMetrics.incomeVsExpense}
        runningBalance={financeMetrics.runningBalance}
        formatIDR={formatIDR}
      />

      <ActivityOverview 
        divisionProgress={divisionProgress}
        upcomingAgenda={upcomingAgenda}
      />
    </div>
  );
}
