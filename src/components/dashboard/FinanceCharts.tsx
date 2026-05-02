import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface FinanceChartsProps {
  incomeVsExpense: any[];
  runningBalance: any[];
  formatIDR: (val: number) => string;
}

export function FinanceCharts({ incomeVsExpense, runningBalance, formatIDR }: FinanceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Monthly Performance */}
      <Card className="rounded-[3rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
        <CardHeader className="border-b-2 border-[#f4f2ef] p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#f4f2ef] flex items-center justify-center text-[#1c1c1c] border border-[#dcd7cf]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif font-black italic text-[#1c1c1c] tracking-tight">
                  Economic <span className="not-italic text-[#535366]">Performance</span>
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mt-1">Cashflow Flux Analysis</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f2ef" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#535366', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#535366', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={formatIDR}
                />
                <Tooltip 
                  cursor={{ fill: '#f4f2ef' }}
                  contentStyle={{ borderRadius: '1.5rem', border: '2px solid #dcd7cf', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', background: 'white' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#1c1c1c' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, color: '#535366', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={48}>
                  {incomeVsExpense.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1c1c1c' : '#535366'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Balance Trend */}
      <Card className="rounded-[3rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
        <CardHeader className="border-b-2 border-[#f4f2ef] p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/20 border border-white/10">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif font-black italic text-[#1c1c1c] tracking-tight">
                  Capital <span className="not-italic text-[#535366]">Trajectory</span>
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mt-1">Accumulated Position Trend</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={runningBalance}>
                <defs>
                  <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1c1c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1c1c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f2ef" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#535366', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(val) => val === 'Start' ? val : new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#535366', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={formatIDR}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: '2px solid #dcd7cf', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', background: 'white' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#1c1c1c' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, color: '#535366', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Position']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#1c1c1c" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorBal)"
                  dot={{ r: 6, fill: '#1c1c1c', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 0, fill: '#1c1c1c' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
