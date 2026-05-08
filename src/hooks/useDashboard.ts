import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DIVISIONS } from '@/lib/constants';
import { parseISO, getMonth, getYear } from 'date-fns';

export function useDashboard(selectedMonth: string, selectedYear: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    members: { value: '0', sub: 'Active members' },
    tasks: { value: '0', sub: 'In progress' },
    balance: { value: 'Rp 0', sub: 'Net total' },
    cashOnHand: { value: 'Rp 0', sub: 'Approved cash' }
  });

  const [financeMetrics, setFinanceMetrics] = useState({
    incomeVsExpense: [] as any[],
    runningBalance: [] as any[],
    expenseBreakdown: [] as any[],
    incomeBreakdown: [] as any[],
    highestCategory: { name: 'None', amount: 0 },
    outstandingDues: 0,
    totalTransCount: 0,
    filteredTransCount: 0
  });

  const [divisionProgress, setDivisionProgress] = useState<any[]>([]);
  const [upcomingAgenda, setUpcomingAgenda] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [membersRes, tasksRes, transRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('tasks').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: true })
      ]);

      if (membersRes.error) throw membersRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (transRes.error) throw transRes.error;

      const allTrans = transRes.data || [];
      const allTasks = tasksRes.data || [];
      const totalMembers = membersRes.count || 0;

      // 1. Division Progress
      const divStats = DIVISIONS.map(div => {
        const divTasks = allTasks.filter(t => t.division === div);
        const doneTasks = divTasks.filter(t => t.status === 'done').length;
        const total = divTasks.length;
        const progress = total > 0 ? Math.round((doneTasks / total) * 100) : 0;
        return { label: div, progress, count: `${doneTasks} of ${total}` };
      }).filter(d => d.progress > 0 || allTasks.some(t => t.division === d.label));
      setDivisionProgress(divStats);

      // 2. Upcoming Agenda
      const now = new Date();
      const agenda = allTasks
        .filter(t => t.deadline && new Date(t.deadline) >= now && t.status !== 'done')
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 3)
        .map(t => {
          const date = new Date(t.deadline!);
          return {
            date: `${date.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${date.getDate()}`,
            title: t.title,
            sub: `${t.division} • ${t.status.replace('_', ' ')}`
          };
        });
      setUpcomingAgenda(agenda);

      // 3. Finance Analytics Logic
      const targetMonth = parseInt(selectedMonth);
      const targetYear = parseInt(selectedYear);

      const filteredTrans = allTrans.filter(t => {
        if (!t.date) return false;
        const d = parseISO(t.date);
        return getMonth(d) === targetMonth && getYear(d) === targetYear;
      });

      const approvedFiltered = filteredTrans.filter(t => t.status === 'approved');
      const incomeTotal = approvedFiltered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const expenseTotal = approvedFiltered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

      const monthlyIVSE = [
        { name: 'Income', amount: incomeTotal },
        { name: 'Expense', amount: expenseTotal }
      ];

      const targetEndOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
      let balanceSum = 0;
      const runningTrend = allTrans
        .filter(t => t.status === 'approved' && parseISO(t.date) <= targetEndOfMonth)
        .map(t => {
          balanceSum += (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
          return { date: t.date, balance: balanceSum };
        });

      const expCategories: Record<string, number> = {};
      const incCategories: Record<string, number> = {};

      approvedFiltered.forEach(t => {
        const cat = t.event_type || t.category || 'General';
        if (t.type === 'expense') {
          expCategories[cat] = (expCategories[cat] || 0) + Number(t.amount);
        } else {
          incCategories[cat] = (incCategories[cat] || 0) + Number(t.amount);
        }
      });

      const expenseBreakdown = Object.entries(expCategories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const incomeBreakdown = Object.entries(incCategories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const highest = expenseBreakdown[0] || { name: 'None', value: 0 };

      const globalApprovedTrans = allTrans.filter(t => t.status === 'approved');
      const currentBalance = globalApprovedTrans.reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
      const outstanding = allTrans.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.amount), 0);

      setFinanceMetrics({
        incomeVsExpense: monthlyIVSE,
        runningBalance: runningTrend.length > 0 ? runningTrend.slice(-30) : [{ date: 'Start', balance: 0 }],
        expenseBreakdown,
        incomeBreakdown,
        highestCategory: { name: highest.name, amount: highest.value },
        outstandingDues: outstanding,
        totalTransCount: allTrans.length,
        filteredTransCount: filteredTrans.length
      });

      setStats({
        members: { value: totalMembers.toString(), sub: 'Active members' },
        tasks: { value: allTasks.filter(t => t.status !== 'done').length.toString(), sub: 'Pending tasks' },
        balance: { value: `Rp ${(currentBalance / 1000000).toFixed(1)}M`, sub: 'Current Net' },
        cashOnHand: { value: `Rp ${currentBalance.toLocaleString()}`, sub: 'Liquid' }
      });

    } catch (err: any) {
      console.error('[useDashboard] Error fetching stats:', err);
      toast.error('Failed to refresh analytics');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    stats,
    financeMetrics,
    divisionProgress,
    upcomingAgenda,
    refresh: fetchData
  };
}
