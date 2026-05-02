import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { DIVISIONS, APP_CONFIG } from '@/lib/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useRegistration } from '@/hooks/useRegistration';
import { UserPlus, ShieldCheck, ArrowRight, BookOpen, GraduationCap, Mail, Lock } from 'lucide-react';

export function RegisterPage() {
  useDocumentTitle('Register');
  const { register, handleSubmit, setValue, errors, isLoading, divisionParam } = useRegistration();

  const FieldError = ({ name }: { name: keyof typeof errors }) => (
    errors[name] ? <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest pl-1 mt-1">{errors[name]?.message}</p> : null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eae6e0] p-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
        className="w-full max-w-2xl"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-[#535366] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-[#535366]/20 mb-6 relative group overflow-hidden border-4 border-white">
            <UserPlus className="h-10 w-10 relative z-10" />
          </div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-[#1c1c1c] italic">ENROLLMENT <span className="not-italic text-[#535366]">REQUEST</span></h1>
          <div className="flex items-center gap-3 text-[#535366]/40 bg-white/50 border border-[#dcd7cf] px-5 py-2.5 rounded-2xl mt-4 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{divisionParam ? `Direct Entry: ${divisionParam} Division` : 'Organizational Access Application'}</p>
          </div>
        </div>

        <Card className="border-2 border-[#dcd7cf] shadow-[0_32px_64px_-12px_rgba(28,28,28,0.1)] rounded-[3.5rem] overflow-hidden bg-white premium-shadow">
          <CardHeader className="space-y-2 p-12 pb-10 border-b-2 border-[#f4f2ef]">
            <CardTitle className="text-2xl font-heading font-black tracking-tight text-[#1c1c1c]">Member Registration</CardTitle>
            <CardDescription className="text-[#535366]/60 font-black uppercase text-[10px] tracking-[0.2em]">Submit identification for system verification</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-10 p-12 pt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Legal Full Name</Label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors"><BookOpen className="h-5 w-5" /></div>
                    <Input {...register('fullName')} placeholder="Primary Name" className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all rounded-2xl h-14 pl-14 pr-6 font-bold text-sm" />
                  </div>
                  <FieldError name="fullName" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Institutional ID</Label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors"><GraduationCap className="h-5 w-5" /></div>
                    <Input {...register('studentId')} placeholder="Student Serial" className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all rounded-2xl h-14 pl-14 pr-6 font-bold text-sm" />
                  </div>
                  <FieldError name="studentId" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Division Assignment</Label>
                <Select onValueChange={(val) => setValue('division', val || '')} defaultValue={divisionParam || undefined} disabled={!!divisionParam}>
                  <SelectTrigger className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] rounded-2xl h-14 px-6 font-bold text-sm focus:border-[#1c1c1c] focus:ring-0">
                    <SelectValue placeholder="Select Division Context" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-[#dcd7cf] shadow-2xl">
                    {DIVISIONS.map((div) => <SelectItem key={div} value={div} className="py-3 font-bold text-xs uppercase tracking-widest">{div}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FieldError name="division" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Verified Email Endpoint</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors"><Mail className="h-5 w-5" /></div>
                  <Input {...register('email')} type="email" placeholder="name@university.edu" className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all rounded-2xl h-14 pl-14 pr-6 font-bold text-sm" />
                </div>
                <FieldError name="email" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Secure Passcode</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors"><Lock className="h-5 w-5" /></div>
                  <Input {...register('password')} type="password" className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all rounded-2xl h-14 pl-14 pr-6 font-bold text-sm" />
                </div>
                <p className="text-[9px] font-black text-[#535366]/30 uppercase tracking-[0.2em] pl-1 italic">Note: Use Student ID as initial verification passcode.</p>
                <FieldError name="password" />
              </div>
            </CardContent>
            <CardFooter className="p-12 pt-0 flex flex-col gap-6">
              <Button type="submit" className="w-full bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-16 shadow-2xl shadow-black/10 transition-all active:scale-95 uppercase text-xs tracking-[0.4em] group" disabled={isLoading}>
                {isLoading ? 'Processing Request...' : 'Initialize Enrollment'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#535366]/30">Existing Identity?</span>
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-[#1c1c1c] hover:underline underline-offset-4 decoration-2">Enter Nexus</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
