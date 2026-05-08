import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES, BATCH_YEARS, DIVISIONS } from '@/lib/constants';
import { User, Mail, Hash, Briefcase, Calendar, Shield, Save, Loader2, Fingerprint, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isUpdating: boolean;
  onUpdate?: (e: React.FormEvent) => void;
  isSuperAdmin?: boolean;
  readOnly?: boolean;
  isRestricted?: boolean;
}

export function ProfileForm({
  formData, setFormData, isUpdating, onUpdate, isSuperAdmin = false, readOnly = false, isRestricted = false
}: ProfileFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) onUpdate(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <Card className="rounded-[3rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
        <CardHeader className="bg-[#f4f2ef]/50 border-b-2 border-[#f4f2ef] p-12">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/10">
              <User className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading font-black tracking-tight text-[#1c1c1c]">Personal <span className="text-[#535366]">Credentials</span></CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mt-1">Registry Data Synchronization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Entity Name</Label>
              <div className="relative group">
                <User className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
                <Input 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  readOnly={readOnly}
                  className="pl-14 rounded-2xl h-16 font-bold text-base bg-[#f4f2ef]/30 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all read-only:bg-[#f4f2ef]/10 read-only:border-[#dcd7cf]/50"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Student Identifier</Label>
              <div className="relative group">
                <Hash className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", isRestricted || readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
                <Input 
                  value={formData.student_id} 
                  onChange={e => setFormData({...formData, student_id: e.target.value})} 
                  readOnly={isRestricted || readOnly}
                  className="pl-14 rounded-2xl h-16 font-bold text-base bg-[#f4f2ef]/30 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all read-only:bg-[#f4f2ef]/10 read-only:border-[#dcd7cf]/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Operational Division</Label>
              <div className="relative group">
                <Briefcase className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10", isRestricted || readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
                <Select disabled={isRestricted || readOnly} value={formData.division} onValueChange={v => setFormData({...formData, division: v})}>
                  <SelectTrigger className="pl-14 rounded-2xl h-16 font-bold text-base bg-[#f4f2ef]/30 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0">
                    <SelectValue placeholder="Select Context" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-[#dcd7cf] shadow-2xl">
                    {DIVISIONS.map(d => <SelectItem key={d} value={d} className="py-3 font-bold text-xs uppercase tracking-widest">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Academic Cohort</Label>
              <div className="relative group">
                <Calendar className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10", isRestricted || readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
                <Select disabled={isRestricted || readOnly} value={formData.batch} onValueChange={v => setFormData({...formData, batch: v})}>
                  <SelectTrigger className="pl-14 rounded-2xl h-16 font-bold text-base bg-[#f4f2ef]/30 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-[#dcd7cf] shadow-2xl">
                    {BATCH_YEARS.map(y => <SelectItem key={y} value={y} className="py-3 font-bold text-xs uppercase tracking-widest">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t-2 border-[#f4f2ef]">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Administrative Role Access</Label>
            <div className="relative group">
              <ShieldCheck className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10", !isSuperAdmin || readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
              <Select disabled={!isSuperAdmin || readOnly} value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                <SelectTrigger className="pl-14 rounded-2xl h-16 font-black text-sm bg-[#1c1c1c] text-white border-none shadow-xl shadow-black/10 disabled:bg-[#f4f2ef]/50 disabled:text-[#1c1c1c]/40 disabled:border-2 disabled:border-[#dcd7cf] disabled:shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-[#dcd7cf] shadow-2xl">
                  {ROLES.map(r => (
                    <SelectItem key={r.id} value={r.id} className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full shadow-inner", r.color.replace('bg-', 'bg-').replace('text-', 'bg-'))}></div>
                        <span className="font-black text-[10px] uppercase tracking-widest">{r.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isSuperAdmin && !readOnly && (
                <div className="flex items-center gap-2 mt-3 px-1">
                  <Fingerprint className="h-3 w-3 text-[#535366]/30" />
                  <p className="text-[9px] text-[#535366]/30 font-black uppercase tracking-widest italic">Clearance Modification Restricted to Super Admin Level</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10 pt-10 border-t-2 border-[#f4f2ef]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#535366] flex items-center justify-center text-white shadow-lg">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#1c1c1c]">Security Nexus</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Verified Registry Email</Label>
                <div className="relative group">
                  <Mail className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
                  <Input 
                    type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                    readOnly={readOnly}
                    className="pl-14 rounded-2xl h-16 font-bold text-base bg-[#f4f2ef]/30 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all read-only:bg-[#f4f2ef]/10 read-only:border-[#dcd7cf]/50"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Update Access Passcode</Label>
                <div className="relative group">
                  <Shield className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", readOnly ? "text-[#535366]/20" : "text-[#535366]/40 group-focus-within:text-[#1c1c1c]")} />
                  <Input 
                    type="password" placeholder="System Encrypted" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                    readOnly={readOnly}
                    className="pl-14 rounded-2xl h-16 font-bold text-base bg-[#f4f2ef]/30 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all read-only:bg-[#f4f2ef]/10 read-only:border-[#dcd7cf]/50"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {!readOnly && (
            <div className="pt-8 flex justify-end">
              <Button 
                type="submit" disabled={isUpdating} 
                className="w-full md:w-auto min-w-[280px] bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-16 shadow-2xl shadow-black/20 transition-all active:scale-95 gap-3 uppercase text-xs tracking-[0.4em]"
              >
                {isUpdating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                Synchronize Registry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
