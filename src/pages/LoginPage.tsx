import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ShieldCheck, Mail, Lock, Fingerprint, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  useDocumentTitle('Login');
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (err: any) {
      const msg = err.message === 'Invalid login credentials' 
        ? 'Invalid credentials. First time? Use your Student ID as password.' 
        : err.message || 'Failed to login';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eae6e0] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-[#1c1c1c] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-black/20 mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Fingerprint className="h-10 w-10 relative z-10" />
          </div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-[#1c1c1c] italic">FOLKS <span className="not-italic text-[#535366]">HUB</span></h1>
          <div className="flex items-center gap-3 text-[#535366]/40 bg-white/50 border border-[#dcd7cf] px-4 py-2 rounded-xl mt-4 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Oversight Registry</p>
          </div>
        </div>

        <Card className="border-2 border-[#dcd7cf] shadow-[0_32px_64px_-12px_rgba(28,28,28,0.1)] rounded-[3rem] overflow-hidden bg-white premium-shadow">
          <CardHeader className="space-y-2 p-10 pb-8 border-b-2 border-[#f4f2ef]">
            <CardTitle className="text-2xl font-heading font-black tracking-tight text-[#1c1c1c]">Secure Authentication</CardTitle>
            <CardDescription className="text-[#535366]/60 font-black uppercase text-[10px] tracking-[0.2em]">Verify credentials to access operational nexus</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-8 p-10">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Registry Email</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email" type="email" placeholder="official@organization.edu"
                    className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all rounded-2xl h-14 pl-14 pr-6 font-bold text-sm"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">Access Passcode</Label>
                  <Button variant="link" size="sm" className="px-0 font-black h-auto text-[#535366]/40 hover:text-[#1c1c1c] text-[10px] uppercase tracking-widest transition-colors">
                    Lost Passcode?
                  </Button>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password" type="password"
                    className="bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 transition-all rounded-2xl h-14 pl-14 pr-6 font-bold text-sm"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex flex-col gap-6">
              <Button type="submit" className="w-full bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-16 shadow-2xl shadow-black/10 transition-all active:scale-95 uppercase text-xs tracking-[0.4em] group" disabled={isLoading}>
                {isLoading ? 'Decrypting Access...' : 'Authenticate'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#535366]/30">New Entity?</span>
                <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-[#1c1c1c] hover:underline underline-offset-4 decoration-2">Request Enrollment</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-[9px] font-black text-[#535366]/30 uppercase tracking-[0.5em] text-center">
            FolksHub Internal Nexus — Version 4.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
