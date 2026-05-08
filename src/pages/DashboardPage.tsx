import React from 'react';
import { 
  BarChart3,
  Filter,
  Download,
  LayoutDashboard,
  Calendar
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
import { FinancialHealthGauge } from '@/components/dashboard/FinancialHealthGauge';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { profile } = useAuthStore();
  
  const [selectedMonth, setSelectedMonth] = React.useState<string>((new Date().getMonth()).toString());
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());

  const {
    isLoading, stats, financeMetrics, divisionProgress, upcomingAgenda
  } = useDashboard(selectedMonth, selectedYear);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatIDR = (val: number) => {
    if (val >= 1000000) return `Rp ${(val/1000000).toFixed(1)}M`;
    if (val >= 1000) return `Rp ${(val/1000).toFixed(0)}K`;
    return `Rp ${val}`;
  };

  const handleExport = () => {
    const data = { period: `${MONTHS[parseInt(selectedMonth)]} ${selectedYear}`, stats, metrics: financeMetrics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_summary_${selectedMonth}_${selectedYear}.json`;
    link.click();
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/10 border border-white/10">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-heading font-black text-[#1c1c1c] tracking-tight italic">
              {getGreeting()}, <span className="not-italic text-[#535366]">{profile?.full_name?.split(' ')[0] || 'Member'}</span>
            </h1>
          </div>
          <FinancialHealthGauge 
            collected={stats.totalCollections} 
            target={stats.targetRevenue} 
            isLoading={isLoading} 
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2.5rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5">
          <div className="flex items-center gap-3 pl-6 pr-4 border-r-2 border-[#dcd7cf] hidden sm:flex">
            <Calendar className="h-4 w-4 text-[#535366]" />
            <span className="text-[10px] font-black text-[#535366]/40 uppercase tracking-[0.2em]">Timeframe</span>
          </div>
          
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] rounded-[1.5rem] border-none bg-[#f4f2ef]/50 h-14 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#dcd7cf] shadow-2xl">
              {MONTHS.map((m, i) => <SelectItem key={i} value={i.toString()} className="font-bold text-xs py-3">{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[110px] rounded-[1.5rem] border-none bg-[#f4f2ef]/50 h-14 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#dcd7cf] shadow-2xl">
              {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y} className="font-bold text-xs py-3">{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-14 w-14 rounded-[1.5rem] hover:bg-[#1c1c1c] text-[#535366] hover:text-white transition-all shadow-xl shadow-black/5"
            onClick={handleExport}
          >
            <Download className="h-5 w-5" />
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
      />
    </div>
  );
}
