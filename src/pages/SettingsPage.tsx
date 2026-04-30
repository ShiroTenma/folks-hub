import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Calendar,
  Shield,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [months, setMonths] = useState<string[]>([]);
  const [newMonth, setNewMonth] = useState('');

  const [ledgerEvents, setLedgerEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState('');

  const [ledgerPaymentTypes, setLedgerPaymentTypes] = useState<string[]>([]);
  const [newPaymentType, setNewPaymentType] = useState('');

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      data?.forEach(setting => {
        if (setting.key === 'monthly_cash_fee') {
          setMonthlyFee(Number(setting.value));
        } else if (setting.key === 'monthly_cash_months') {
          setMonths(setting.value as string[]);
        } else if (setting.key === 'ledger_events') {
          setLedgerEvents(setting.value as string[]);
        } else if (setting.key === 'ledger_payment_types') {
          setLedgerPaymentTypes(setting.value as string[]);
        }
      });
    } catch (error: any) {
      toast.error('Failed to load settings: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Unauthorized');
      return;
    }

    setIsSaving(true);
    try {
      const updates = [
        { key: 'monthly_cash_fee', value: JSON.stringify(monthlyFee), updated_by: profile?.id },
        { key: 'monthly_cash_months', value: JSON.stringify(months), updated_by: profile?.id },
        { key: 'ledger_events', value: JSON.stringify(ledgerEvents), updated_by: profile?.id },
        { key: 'ledger_payment_types', value: JSON.stringify(ledgerPaymentTypes), updated_by: profile?.id }
      ];

      for (const update of updates) {
        const { error } = await supabase.from('settings').upsert({
          key: update.key,
          value: update.value,
          updated_at: new Date().toISOString(),
          updated_by: update.updated_by
        });
        if (error) throw error;
      }

      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error('Save failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addMonth = () => {
    if (!newMonth) return;
    if (months.includes(newMonth)) return toast.error('Month already exists');
    setMonths([...months, newMonth]);
    setNewMonth('');
  };

  const addEvent = () => {
    if (!newEvent) return;
    if (ledgerEvents.includes(newEvent)) return toast.error('Event already exists');
    setLedgerEvents([...ledgerEvents, newEvent]);
    setNewEvent('');
  };

  const addPaymentType = () => {
    if (!newPaymentType) return;
    if (ledgerPaymentTypes.includes(newPaymentType)) return toast.error('Type already exists');
    setLedgerPaymentTypes([...ledgerPaymentTypes, newPaymentType]);
    setNewPaymentType('');
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="h-16 w-16 text-rose-500 opacity-20" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Access Denied</h2>
        <p className="text-slate-500 font-medium">Only administrators can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-indigo-600" />
            Global Settings
          </h1>
          <p className="text-slate-500 text-sm font-medium">Manage organization-wide configurations and dues.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95 gap-2"
        >
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE CHANGES
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Monthly Cash Settings */}
        <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Monthly Cash Configuration</CardTitle>
                <CardDescription className="text-xs">Set the monthly fee and trackable periods.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="max-w-xs space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Monthly Fee (Rp)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
                <Input 
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="pl-12 rounded-xl border-slate-200 h-12 font-black text-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tracked Months / Periods</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Aug-2025"
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="rounded-xl border-slate-200 h-11"
                  onKeyPress={(e) => e.key === 'Enter' && addMonth()}
                />
                <Button onClick={addMonth} className="bg-slate-900 text-white rounded-xl h-11 px-4 font-bold"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {months.map(month => (
                  <Badge key={month} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none py-2 px-4 rounded-xl flex items-center gap-2 group transition-all">
                    <span className="font-bold text-xs">{month}</span>
                    <button onClick={() => setMonths(months.filter(m => m !== month))} className="text-slate-400 hover:text-rose-500"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Settings */}
        <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Ledger Configuration</CardTitle>
                <CardDescription className="text-xs">Manage events and payment methods for the ledger.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Events</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. SPONSORSHIP"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  className="rounded-xl border-slate-200 h-11 font-bold"
                  onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                />
                <Button onClick={addEvent} className="bg-slate-900 text-white rounded-xl h-11 px-4 font-bold"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {ledgerEvents.map(ev => (
                  <Badge key={ev} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none py-2 px-4 rounded-xl flex items-center gap-2 group transition-all">
                    <span className="font-bold text-xs">{ev}</span>
                    <button onClick={() => setLedgerEvents(ledgerEvents.filter(e => e !== ev))} className="text-slate-400 hover:text-rose-500"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Types / Sources</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. OVO"
                  value={newPaymentType}
                  onChange={(e) => setNewPaymentType(e.target.value)}
                  className="rounded-xl border-slate-200 h-11 font-bold"
                  onKeyPress={(e) => e.key === 'Enter' && addPaymentType()}
                />
                <Button onClick={addPaymentType} className="bg-slate-900 text-white rounded-xl h-11 px-4 font-bold"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {ledgerPaymentTypes.map(pt => (
                  <Badge key={pt} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none py-2 px-4 rounded-xl flex items-center gap-2 group transition-all">
                    <span className="font-bold text-xs">{pt}</span>
                    <button onClick={() => setLedgerPaymentTypes(ledgerPaymentTypes.filter(t => t !== pt))} className="text-slate-400 hover:text-rose-500"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
          <Calendar className="h-6 w-6 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900">Important Note</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Changing these settings will immediately affect the dropdowns and calculations in the Finance and Monthly Cash pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
