import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  CalendarDays,
  Plus,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { APP_CONFIG, DIVISIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { profile } = useAuthStore();
  const [stats, setStats] = React.useState({
    members: { value: '0', sub: '0 new', change: 'Stable' },
    tasks: { value: '0', sub: '0 in progress', change: 'Live' },
    balance: { value: 'Rp 0', sub: '0 pending', change: 'Real-time' },
    programs: { value: '0', sub: 'Upcoming', change: 'Live' }
  });
  const [divisionProgress, setDivisionProgress] = React.useState<any[]>([]);
  const [upcomingAgenda, setUpcomingAgenda] = React.useState<any[]>([]);
  const [financeChartData, setFinanceChartData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [membersRes, tasksRes, transRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('tasks').select('*'),
        supabase.from('transactions').select('*')
      ]);

      if (membersRes.error) throw membersRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (transRes.error) throw transRes.error;

      // Calculate Member Stats
      const totalMembers = membersRes.count || 0;
      
      // Calculate Task Stats
      const allTasks = tasksRes.data || [];
      const pendingTasks = allTasks.filter(t => t.status !== 'done').length;
      const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length;

      // Calculate Division Progress (Dynamic from DB)
      const divStats = DIVISIONS.map(div => {
        const divTasks = allTasks.filter(t => t.division === div);
        const doneTasks = divTasks.filter(t => t.status === 'done').length;
        const total = divTasks.length;
        const progress = total > 0 ? Math.round((doneTasks / total) * 100) : 0;
        return { label: div, progress, count: `${doneTasks} of ${total}` };
      }).filter(d => d.progress > 0 || allTasks.some(t => t.division === d.label));
      
      setDivisionProgress(divStats);

      // Calculate Upcoming Agenda (Tasks with deadlines in the future, sorted)
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

      // Calculate Finance Stats & Chart
      const allTrans = transRes.data || [];
      const income = allTrans
        ?.filter(t => t.type === 'income' && t.status === 'approved')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const expense = allTrans
        ?.filter(t => t.type === 'expense' && t.status === 'approved')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = income - expense;
      const pendingTrans = allTrans?.filter(t => t.status === 'pending').length || 0;

      // Generate Monthly Chart Data
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = monthNames.map((name, index) => {
        const monthlyTotal = allTrans
          .filter(t => {
            const d = new Date(t.date!);
            return d.getMonth() === index && t.status === 'approved';
          })
          .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
        return { name, amount: Math.max(0, monthlyTotal / 1000) }; // Showing in K for chart scale
      }).slice(Math.max(0, new Date().getMonth() - 5), new Date().getMonth() + 1);

      setFinanceChartData(monthlyData);

      setStats({
        members: { value: totalMembers.toString(), sub: 'Active members', change: 'Stable' },
        tasks: { value: pendingTasks.toString(), sub: `${inProgressCount} in progress`, change: 'Live' },
        balance: { value: `Rp ${(balance / 1000000).toFixed(1)}M`, sub: `${pendingTrans} pending`, change: 'Real-time' },
        programs: { value: agenda.length.toString(), sub: 'Upcoming', change: 'Live' }
      });
    } catch (err: any) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-slate-500 text-sm">
          Here's what's happening with {APP_CONFIG.ORG_NAME} today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Members', value: stats.members.value, icon: Users, sub: stats.members.sub, change: stats.members.change, color: 'bg-blue-50 text-blue-600', badgeColor: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Tasks', value: stats.tasks.value, icon: CheckCircle2, sub: stats.tasks.sub, change: stats.tasks.change, color: 'bg-indigo-50 text-indigo-600', badgeColor: 'bg-indigo-50 text-indigo-500' },
          { label: 'Org Balance', value: stats.balance.value, icon: Wallet, sub: stats.balance.sub, change: stats.balance.change, color: 'bg-emerald-50 text-emerald-600', badgeColor: 'bg-emerald-50 text-emerald-500' },
          { label: 'Upcoming Programs', value: stats.programs.value, icon: CalendarDays, sub: stats.programs.sub, change: 'Live', color: 'bg-amber-50 text-amber-600', badgeColor: 'bg-slate-50 text-slate-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-2 rounded-lg", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", stat.badgeColor)}>
                    {isLoading ? '...' : stat.change}
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : stat.value}</p>
                  <span className="text-xs text-slate-400 font-medium">{isLoading ? 'Updating...' : stat.sub}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Visual Grid */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          {/* Monthly Cashflow Card */}
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Monthly Cashflow</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Total net income per month (in thousands)</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              {isLoading ? (
                <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {financeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === financeChartData.length - 1 ? '#4F46E5' : '#E2E8F0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Unit Performance Card */}
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Division Progress</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Live completion rate based on tasks table</CardDescription>
              </div>
              <Target className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /><div className="h-3 w-16 bg-slate-50 animate-pulse rounded" /></div>
                      <div className="h-2 w-full bg-slate-100 animate-pulse rounded-full" />
                    </div>
                  ))}
                </div>
              ) : divisionProgress.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-100 rounded-2xl">
                  <CheckCircle2 className="h-6 w-6 opacity-20" />
                  <p className="italic text-xs font-bold uppercase tracking-widest">No active tasks in database</p>
                </div>
              ) : (
                divisionProgress.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.count} Done</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, delay: idx * 0.2 }}
                        className="bg-indigo-600 h-full rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 flex flex-col gap-8">
          {/* Upcoming Agenda */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span> 
              Upcoming Deadlines
            </h3>
            <div className="space-y-6 relative z-10">
              {isLoading ? (
                [1, 2].map(i => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />)
              ) : upcomingAgenda.length === 0 ? (
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-4 italic">No upcoming deadlines found</p>
              ) : (
                upcomingAgenda.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-3 py-2 shrink-0 border border-white/5">
                      <span className="text-indigo-400 text-[10px] font-bold tracking-tighter">{item.date.split(' ')[0]}</span>
                      <span className="text-xl font-bold leading-none">{item.date.split(' ')[1]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{item.sub}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="rounded-2xl border-slate-200 shadow-sm flex flex-col p-6 bg-white">
            <h3 className="font-bold text-slate-800 mb-6 text-sm flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-indigo-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Task', icon: '📝', path: '/tasks' },
                { label: 'Add Member', icon: '👤', path: '/members' },
                { label: 'Add Income', icon: '💰', path: '/finance' },
                { label: 'Alerts', icon: '🔔', path: '/notifications' },
              ].map((btn, i) => (
                <Link 
                  key={i}
                  to={btn.path}
                  className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all hover:border-indigo-200 active:scale-95 text-slate-600 bg-white group/btn"
                >
                  <span className="text-xl mb-2 group-hover/btn:scale-110 transition-transform">{btn.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover/btn:text-indigo-600">{btn.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Live Status */}
          <Card className="rounded-2xl border-slate-200 shadow-sm flex flex-col p-6 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              Live Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">System Health</span>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase tracking-tighter">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Sync</span>
                <span className="text-[10px] font-bold text-slate-900 uppercase">Supabase Realtime</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
