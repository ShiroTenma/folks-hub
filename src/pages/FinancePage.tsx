import React from 'react';
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
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar as CalendarIcon,
  Tag,
  MapPin,
  CreditCard,
  User as UserIcon,
  Loader2,
  Trash2,
  PieChart,
  Edit2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { TransactionForm } from '@/components/TransactionForm';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DIVISIONS } from '@/lib/constants';

const DEFAULT_EVENTS = [
  'Opening Balance', 'WP', 'Equipment', 'Misc', 'Cash', 
  'Operational Expense', 'WP Staff', 'Merchandise', 
  'Sertijab', 'PnC', 'Open House', 'Commission', 'SPIN', 'ETAM'
];

const DEFAULT_PAYMENT_TYPES = ['DANA', 'BNI', 'Cash'];

export function FinancePage() {
  const { profile } = useAuthStore();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<any>(null);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [budgets, setBudgets] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<string[]>(DEFAULT_EVENTS);
  const [paymentTypes, setPaymentTypes] = React.useState<string[]>(DEFAULT_PAYMENT_TYPES);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterDivision, setFilterDivision] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [filterEvent, setFilterEvent] = React.useState('all');
  const [filterPaymentType, setFilterPaymentType] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 20;

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
  const isBPH = profile?.division === 'BPH';
  const canApprove = isAdmin || isBPH;

  // Helper for pastel colors based on string hash
  const getPastelColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 70%, 92%, 1)`;
  };

  const getPastelTextColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 80%, 30%, 1)`;
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, budgetRes, settingsRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: true }),
        supabase.from('event_budgets').select('*'),
        supabase.from('settings').select('*')
      ]);

      if (transRes.error) throw transRes.error;
      
      setTransactions(transRes.data || []);
      setBudgets(budgetRes.data || []);

      settingsRes.data?.forEach(s => {
        if (s.key === 'ledger_events') setEvents(s.value);
        if (s.key === 'ledger_payment_types') setPaymentTypes(s.value);
      });

    } catch (err: any) {
      toast.error('Failed to load ledger: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Transaction ${status}`);
      fetchData();
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Transaction deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleDeleteAll = async () => {
    const confirm1 = confirm('WARNING: This will permanently delete ALL transactions in the ledger. This cannot be undone. Proceed?');
    if (!confirm1) return;
    
    const confirm2 = confirm('FINAL CONFIRMATION: Are you absolutely sure you want to clear the entire ledger?');
    if (!confirm2) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error) throw error;
      toast.success('All ledger data has been cleared');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to clear ledger: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = [
      'Type', 'Date', 'Month', 'Event', 'Item', 'Debt', 'Credit', 
      'Amount', 'Division', 'From', 'To', 'Place', 'Payment Type', 'Status', 'Notes'
    ];
    
    const rows = transactions.map(t => [
      t.type,
      new Date(t.date).toLocaleDateString(),
      new Date(t.date).toLocaleString('default', { month: 'long' }),
      t.event_type || '',
      t.item_name || t.description,
      t.debt_amount || 0,
      t.credit_amount || 0,
      t.amount,
      t.division_target || t.category,
      t.from_entity || '',
      t.to_entity || '',
      t.location || '',
      t.payment_type || '',
      t.status,
      t.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `folks_finance_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exporting ledger to CSV...');
  };

  const handleImportExcel = () => {
    toast.info(
      <div className="space-y-2">
        <p className="font-bold">Excel Import Template</p>
        <p className="text-[10px]">Prepare a CSV with these columns:</p>
        <code className="bg-slate-100 p-1 rounded block text-[9px]">date, type (income/expense), amount, item_name, event_type, payment_type (DANA/BNI/Cash), division_target</code>
        <Button size="sm" variant="outline" className="h-7 text-[10px] w-full" onClick={() => document.getElementById('excel-input')?.click()}>CHOOSE FILE</Button>
      </div>,
      { duration: 10000 }
    );
  };

  const processImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = event.target?.result as string;
        // Strip BOM
        if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return;

        const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
        const rawHeaders = lines[0].split(delimiter).map(h => 
          h.trim().toLowerCase().replace(/"/g, '').replace(/\s+/g, '_')
        );
        
        console.log('--- CSV Import Debug ---');
        console.log('Delimiter:', delimiter);
        console.log('Headers:', rawHeaders);

        const parseAmount = (val: any) => {
          if (!val) return 0;
          let raw = val.toString().replace(/[Rp\s]/g, '');
          if (raw.includes(',') && raw.includes('.')) {
            const first = raw.indexOf(',');
            const second = raw.indexOf('.');
            if (first < second) raw = raw.replace(/,/g, '');
            else raw = raw.replace(/\./g, '').replace(',', '.');
          } else {
            const parts = raw.split(/[.,]/);
            if (parts.length === 2 && parts[1].length === 3) raw = raw.replace(/[.,]/g, '');
            else if (parts.length === 2) raw = raw.replace(',', '.');
            else raw = raw.replace(/[.,]/g, '');
          }
          return Math.abs(parseFloat(raw)) || 0;
        };

        const data = lines.slice(1).map((line, idx) => {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === delimiter && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else current += char;
          }
          values.push(current.trim());

          const obj: any = {};
          rawHeaders.forEach((h, i) => { 
            obj[h] = values[i]?.replace(/"/g, ''); 
          });

          // Detect Type
          let type: 'income' | 'expense' = 'expense';
          const typeVal = (obj.type || '').toLowerCase();
          const creditVal = parseAmount(obj.credit || obj.credit_amount);
          const debtVal = parseAmount(obj.debt || obj.debt_amount);

          if (typeVal.includes('in')) type = 'income';
          else if (typeVal.includes('ex')) type = 'expense';
          else if (creditVal > 0) type = 'income';
          else if (debtVal > 0) type = 'expense';

          const amount = parseAmount(obj.amount || obj.total || obj.nilai || (type === 'income' ? creditVal : debtVal));

          // Date format help
          let dateStr = obj.date || new Date().toISOString();
          if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
            const parts = dateStr.split('/');
            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }

          const itemName = obj.item_name || obj.item || obj.description || 'Imported';
          const division = obj.division_target || obj.division || obj.category || 'General';

          return {
            type,
            amount,
            debt_amount: type === 'expense' ? amount : 0,
            credit_amount: type === 'income' ? amount : 0,
            date: dateStr,
            item_name: itemName,
            description: itemName,
            event_type: obj.event_type || obj.event || 'General',
            division_target: division,
            category: division,
            payment_type: obj.payment_type || obj.payment || 'Cash',
            from_entity: obj.from_entity || obj.from || '',
            to_entity: obj.to_entity || obj.to || '',
            location: obj.location || obj.place || '',
            notes: obj.notes || '',
            status: canApprove ? 'approved' : 'pending'
          };
        });

        console.log('Sample Data (First 2 rows):', data.slice(0, 2));
        
        const { error } = await supabase.from('transactions').insert(data);
        if (error) throw error;
        
        toast.success(`Imported ${data.length} records. ${!canApprove ? 'Waiting for approval.' : ''}`);
        fetchData();
      } catch (err: any) {
        console.error('Import Error:', err);
        toast.error('Import failed: ' + (err.message || 'Check console'));
      }
    };
    reader.readAsText(file);
  };

  // Logic: Running Balance
  const transactionsWithBalance = React.useMemo(() => {
    let current = 0;
    return transactions
      .filter(t => t.status === 'approved')
      .map(t => {
        const amt = Number(t.amount);
        current = t.type === 'income' ? current + amt : current - amt;
        return { ...t, running_balance: current };
      }).reverse(); // Display newest first in table
  }, [transactions]);

  const filteredTransactions = transactionsWithBalance.filter(t => {
    const matchesSearch = (t.item_name || t.description || '').toLowerCase().includes(search.toLowerCase()) ||
                         (t.event_type || '').toLowerCase().includes(search.toLowerCase()) ||
                         (t.from_entity || '').toLowerCase().includes(search.toLowerCase()) ||
                         (t.to_entity || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesDivision = filterDivision === 'all' || t.division_target === filterDivision || t.category === filterDivision;
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesEvent = filterEvent === 'all' || t.event_type === filterEvent;
    const matchesPayment = filterPaymentType === 'all' || t.payment_type === filterPaymentType;
    
    return matchesSearch && matchesDivision && matchesType && matchesEvent && matchesPayment;
  });

  const getSourceBalance = (source: string) => {
    return transactions
      .filter(t => t.status === 'approved' && t.payment_type === source)
      .reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  };

  const totalBalance = React.useMemo(() => {
    return transactions
      .filter(t => t.status === 'approved')
      .reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  }, [transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 text-sm font-medium">Detailed organization cashflow and event accounting.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="rounded-xl border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-widest h-11 px-6 shadow-sm hover:bg-rose-50 gap-2"
              onClick={handleDeleteAll}
            >
              <Trash2 className="h-4 w-4" />
              Delete All Data
            </Button>
          )}
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest h-11 px-6 shadow-sm hover:bg-slate-50 gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95 gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            ADD TRANSACTION
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PieChart className="h-16 w-16" />
          </div>
          <CardContent className="p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Net Balance</p>
            <p className="text-2xl font-black">Rp {totalBalance.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Verified Assets
            </div>
          </CardContent>
        </Card>

        {PAYMENT_TYPES.map(source => {
          const bal = getSourceBalance(source);
          return (
            <Card key={source} className="rounded-3xl border-none shadow-lg bg-white overflow-hidden relative group">
              <CardContent className="p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{source} Balance</p>
                <p className={cn("text-xl font-black", bal < 0 ? "text-rose-600" : "text-slate-900")}>
                  Rp {bal.toLocaleString()}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-full">
                  <CreditCard className="h-3 w-3" />
                  Liquid Funds
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search ledger..." 
                  className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-xs font-bold uppercase tracking-widest shadow-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-36 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterEvent} onValueChange={(v) => { setFilterEvent(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-44 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                    <SelectValue placeholder="Event" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Events</SelectItem>
                    {EVENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterDivision} onValueChange={(v) => { setFilterDivision(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-40 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Divisions</SelectItem>
                    {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterPaymentType} onValueChange={(v) => { setFilterPaymentType(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-40 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Payments</SelectItem>
                    {PAYMENT_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  className="rounded-xl border-slate-200 h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 gap-2 shadow-sm ml-auto"
                  onClick={handleImportExcel}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Import Excel
                </Button>
                <input 
                  id="excel-input" 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={processImport} 
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4 pl-4 md:pl-8 w-12">#</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Type & Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Event & Item</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">From / To</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Debt</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Credit</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-right">Running Balance</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Details</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-4 md:pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={10} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest">Loading ledger data...</TableCell></TableRow>
                  ) : paginatedTransactions.length === 0 ? (
                    <TableRow><TableCell colSpan={10} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest italic">No matching records found.</TableCell></TableRow>
                  ) : (
                    paginatedTransactions.map((t, index) => (
                      <TableRow key={t.id} className="group hover:bg-slate-50/80 transition-colors border-slate-100">
                        <TableCell className="py-5 pl-4 md:pl-8 text-[10px] font-black text-slate-400">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell className="py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                              t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {t.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm capitalize">{t.type}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="space-y-1">
                            <p 
                              className="text-sm font-bold leading-tight line-clamp-2 px-2 py-0.5 rounded-lg w-fit"
                              style={{ backgroundColor: getPastelColor(t.item_name || t.description || ''), color: getPastelTextColor(t.item_name || t.description || '') }}
                            >
                              {t.item_name || t.description}
                            </p>
                            <Badge 
                              variant="outline" 
                              className="text-[9px] font-black uppercase tracking-tighter border-slate-200 rounded px-1.5 whitespace-nowrap"
                              style={{ backgroundColor: getPastelColor(t.event_type || 'General'), color: getPastelTextColor(t.event_type || 'General'), borderColor: 'transparent' }}
                            >
                              {t.event_type || 'General'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="text-slate-300">FR:</span> {t.from_entity || '-'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                              <span className="text-slate-300">TO:</span> {t.to_entity || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-rose-600 text-sm whitespace-nowrap">
                          {t.type === 'expense' ? `(Rp ${Number(t.amount).toLocaleString()})` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600 text-sm whitespace-nowrap">
                          {t.type === 'income' ? `Rp ${Number(t.amount).toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900 whitespace-nowrap bg-indigo-50/20">
                          Rp {Number(t.running_balance).toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <Tag className="h-3 w-3" />
                              {t.division_target || t.category}
                            </div>
                            {t.payment_type && (
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                <CreditCard className="h-3 w-3" />
                                {t.payment_type}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            t.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                            t.status === 'rejected' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4 md:pr-8">
                          <div className="flex items-center justify-end gap-2">
                            {t.receipt_url && (
                              <Button 
                                size="icon" 
                                variant="outline"
                                className="h-9 w-9 rounded-xl text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 transition-colors"
                                onClick={() => window.open(t.receipt_url, '_blank')}
                                title="View Receipt"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl w-56 shadow-2xl p-2 border-slate-100">
                                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Ops</div>
                                <DropdownMenuSeparator />
                                {canApprove && (
                                  <>
                                    <DropdownMenuItem 
                                      className="gap-2 py-3 rounded-xl cursor-pointer text-indigo-600 font-bold focus:bg-indigo-50" 
                                      onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                      Adjust & Review
                                    </DropdownMenuItem>
                                    {t.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-emerald-600 font-bold focus:bg-emerald-50" onClick={() => handleStatusUpdate(t.id, 'approved')}>
                                          <CheckCircle2 className="h-4 w-4" />
                                          Approve Record
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-rose-600 font-bold focus:bg-rose-50" onClick={() => handleStatusUpdate(t.id, 'rejected')}>
                                          <XCircle className="h-4 w-4" />
                                          Reject Record
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-rose-600 font-bold focus:bg-rose-50" onClick={() => handleDelete(t.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  Delete Permanent
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Showing {Math.min(filteredTransactions.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} to {Math.min(filteredTransactions.length, currentPage * ITEMS_PER_PAGE)} of {filteredTransactions.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-white transition-all disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show current page, first, last, and neighbors
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-9 w-9 rounded-xl font-bold text-[10px] transition-all",
                            currentPage === page ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100" : "border-slate-200 hover:bg-white"
                          )}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-slate-300">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-white transition-all disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }} 
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
          fetchData();
        }}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
