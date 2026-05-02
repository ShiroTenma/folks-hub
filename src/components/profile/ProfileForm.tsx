import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES, BATCH_YEARS, DIVISIONS } from '@/lib/constants';
import { User, Mail, Hash, Briefcase, Calendar, Shield, Save, Loader2 } from 'lucide-react';

interface ProfileFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isUpdating: boolean;
  onUpdate: (e: React.FormEvent) => void;
  isSuperAdmin: boolean;
  isRestricted: boolean;
}

export function ProfileForm({
  formData,
  setFormData,
  isUpdating,
  onUpdate,
  isSuperAdmin,
  isRestricted
}: ProfileFormProps) {
  return (
    <form onSubmit={onUpdate}>
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and organization info.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  className="pl-10 rounded-xl h-11 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Student ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  value={formData.student_id} 
                  onChange={e => setFormData({...formData, student_id: e.target.value})} 
                  className="pl-10 rounded-xl h-11 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Division</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                <Select disabled={isRestricted} value={formData.division} onValueChange={v => setFormData({...formData, division: v})}>
                  <SelectTrigger className="pl-10 rounded-xl h-11 font-medium">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Batch Year</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                <Select value={formData.batch} onValueChange={v => setFormData({...formData, batch: v})}>
                  <SelectTrigger className="pl-10 rounded-xl h-11 font-medium">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {BATCH_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">System Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                  <SelectTrigger className="pl-10 rounded-xl h-11 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {ROLES.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Security & Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="pl-10 rounded-xl h-11 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Update Password</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="Leave blank to keep current" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="pl-10 rounded-xl h-11 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isUpdating} 
            className="w-full md:w-auto min-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 gap-2"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            SAVE ALL CHANGES
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
