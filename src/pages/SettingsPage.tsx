import React from 'react';
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
  Tag as TagIcon,
  CreditCard,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/hooks/useSettings';
import { SettingsCard } from '@/components/settings/SettingsCard';

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { profile } = useAuthStore();
  const isAdmin = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin');
  
  const {
    isLoading, isSaving,
    monthlyFee, setMonthlyFee,
    months, setMonths,
    ledgerEvents, setLedgerEvents,
    ledgerPaymentTypes, setLedgerPaymentTypes,
    taskTags, setTaskTags,
    handleSave
  } = useSettings();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center">
        <div className="h-24 w-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10 border-2 border-rose-100">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-black tracking-tight text-[#1c1c1c]">Access Denied</h2>
          <p className="text-[#535366]/60 font-black uppercase text-[10px] tracking-[0.2em]">Elevated Credentials Required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/10">
              <Sliders className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-[#1c1c1c]">System <span className="text-[#535366]">Configuration</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] w-fit px-5 py-2.5 rounded-2xl backdrop-blur-sm">
            <SettingsIcon className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Organization-wide Parameter Control</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-14 px-10 shadow-2xl shadow-black/10 transition-all active:scale-95 gap-3 uppercase text-[11px] tracking-[0.3em]"
        >
          {isSaving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Apply Changes
        </Button>
      </div>

      <div className="grid gap-12">
        <SettingsCard
          title="Monthly Dues Strategy"
          description="Establish global fee benchmarks and tracking cycles."
          icon={DollarSign}
          label="Tracked Cycles / Periods"
          placeholder="e.g. Aug-2025"
          items={months}
          onItemsChange={setMonths}
        >
          <div className="max-w-md space-y-3 mb-10">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Default Unit Fee (IDR)</Label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#535366]/30 text-base">Rp</div>
              <Input 
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="pl-14 pr-8 rounded-[1.5rem] border-2 border-[#dcd7cf] h-16 font-black text-2xl focus:border-[#1c1c1c] focus:ring-0 transition-all bg-[#f4f2ef]/30 group-hover:bg-white"
              />
            </div>
          </div>
        </SettingsCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <SettingsCard
            title="Classification Tags"
            description="Operational event labels for ledger entries."
            icon={Shield}
            label="Registry Events"
            placeholder="e.g. SPONSORSHIP"
            items={ledgerEvents}
            onItemsChange={setLedgerEvents}
          />

          <SettingsCard
            title="Financial Channels"
            description="Define valid transaction mediums."
            icon={CreditCard}
            label="Account Sources"
            placeholder="e.g. OVO"
            items={ledgerPaymentTypes}
            onItemsChange={setLedgerPaymentTypes}
          />
        </div>

        <SettingsCard
          title="Operational Taxonomy"
          description="Define global metadata labels for task management."
          icon={TagIcon}
          label="System-wide Task Tags"
          placeholder="e.g. Urgent, Meeting, Agenda"
          items={taskTags}
          onItemsChange={setTaskTags}
        />

        <div className="bg-[#1c1c1c] rounded-[2.5rem] p-10 border border-[#dcd7cf] flex flex-col md:flex-row gap-8 shadow-2xl shadow-black/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/10">
            <Calendar className="h-8 w-8" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Operational Impact</p>
            <p className="text-xs text-white/60 leading-relaxed max-w-2xl font-medium">
              Synchronizing these parameters will trigger immediate updates across all organizational modules including Finance, Tasks, and Member Registry. Use with discretion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
