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
  Line
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface FinanceChartsProps {
  incomeVsExpense: any[];
  runningBalance: any[];
  formatIDR: (val: number) => string;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export function FinanceCharts({ incomeVsExpense, runningBalance, formatIDR }: FinanceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Monthly Performance */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Monthly Performance
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Cashflow Analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={formatIDR}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                  {incomeVsExpense.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Balance Trend */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Capital Trajectory
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Net Balance Trend</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runningBalance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(val) => val === 'Start' ? val : new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={formatIDR}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Balance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
