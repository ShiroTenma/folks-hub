import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Filter,
  DollarSign,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, type Transaction, type Profile } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TransactionForm } from '@/components/TransactionForm';
import { createNotification } from '@/lib/notifications';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardDescription } from '@/components/ui/card';

export function FinancePage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [profiles, setProfiles] = React.useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, profilesRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (transRes.error) throw transRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setTransactions(transRes.data || []);
      const profileMap = (profilesRes.data || []).reduce((acc, p) => ({
        ...acc,
        [p.id]: p
      }), {});
      setProfiles(profileMap);
    } catch (err: any) {
      toast.error('Failed to load financial data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'pending' | 'rejected', description: string, amount: number, type: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status, 
          approved_by: userData.user?.id 
        })
        .eq('id', id);

      if (error) throw error;
      
      const statusEmoji = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
      await createNotification(
        `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `${statusEmoji} ${description} (Rp ${Math.abs(amount).toLocaleString('id-ID')}) has been marked as ${status}.`,
        status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'
      );
      
      toast.success(`Transaction marked as ${status}`);
      fetchData();
    } catch (err: any) {
      toast.error('Error updating status: ' + err.message);
    }
  };

  const handleDeleteTransaction = async (id: string, description: string) => {
    if (!confirm(`Are you sure you want to delete "${description}"?`)) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await createNotification(
        'Transaction Deleted',
        `🗑️ Record for "${description}" has been removed from the ledger.`,
        'warning'
      );
      
      toast.success('Transaction deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Error deleting: ' + err.message);
    }
  };

  const totals = React.useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income' && t.status === 'approved')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter(t => t.type === 'expense' && t.status === 'approved')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance System</h1>
          <p className="text-slate-500 text-sm">Track income, expenses, and monthly dues.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest h-10 px-4">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm h-10 px-4 text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            ADD TRANSACTION
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-900 text-white rounded-2xl shadow-lg relative overflow-hidden group border-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
          <CardHeader className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Balance</span>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="text-4xl font-bold mt-2 tracking-tighter">
              {isLoading ? '...' : `Rp ${totals.balance.toLocaleString('id-ID')}`}
            </CardTitle>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Net Organization Funds</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Income</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-bold mt-2 text-slate-900">
              {isLoading ? '...' : `Rp ${totals.income.toLocaleString('id-ID')}`}
            </CardTitle>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tight">From approved entries</p>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Expense</span>
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </div>
            <CardTitle className="text-3xl font-bold mt-2 text-slate-900">
              {isLoading ? '...' : `Rp ${totals.expense.toLocaleString('id-ID')}`}
            </CardTitle>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tight">
              {transactions.filter(t => t.type === 'expense' && t.status === 'pending').length} Pending requests
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">Transaction Ledger</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Comprehensive list of all unit finances</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200 text-xs font-bold">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 pl-6 border-none">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-none">Description</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-none">Category</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right border-none">Amount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center border-none">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 pr-6 border-none">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium italic border-none">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium italic border-none">
                    No transactions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, i) => (
                  <motion.tr 
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="py-4 pl-6 border-none">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-tight">
                          {new Date(tx.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(tx.date || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-none">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{tx.description}</span>
                        {tx.approved_by && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            By {profiles[tx.approved_by]?.full_name || 'System'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-none">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 border-none">
                        {tx.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "py-4 text-right font-bold tabular-nums border-none",
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}Rp {Math.abs(Number(tx.amount)).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="py-4 text-center border-none">
                      <Badge className={cn(
                        "rounded-full px-2 text-[10px] font-black uppercase tracking-widest border-none",
                        tx.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      )}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 border-none">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 w-48 shadow-lg">
                          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Manage Record</div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(tx.id, 'approved', tx.description, tx.amount, tx.type)}
                            className="gap-2 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer text-sm font-medium py-2"
                            disabled={tx.status === 'approved'}
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(tx.id, 'rejected', tx.description, tx.amount, tx.type)}
                            className="gap-2 focus:bg-rose-50 focus:text-rose-600 cursor-pointer text-sm font-medium py-2"
                            disabled={tx.status === 'rejected'}
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(tx.id, 'pending', tx.description, tx.amount, tx.type)}
                            className="gap-2 focus:bg-amber-50 focus:text-amber-600 cursor-pointer text-sm font-medium py-2"
                            disabled={tx.status === 'pending'}
                          >
                            <Clock className="h-4 w-4" /> Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTransaction(tx.id, tx.description)}
                            className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer text-sm font-bold py-2"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchData();
        }} 
      />
    </div>
  );
}
