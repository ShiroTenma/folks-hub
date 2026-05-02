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
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-[0_8px_16px_rgba(79,70,229,0.25)]">
            <div className="w-6 h-6 border-4 border-white rounded-md"></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">FOLKS HUB</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Internal Organization Portal</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-1 pb-6 border-b border-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500">Access your division dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-xl h-11"
                  {...register('email')}
                />
                {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</Label>
                  <Button variant="link" size="sm" className="px-0 font-bold h-auto text-indigo-500 hover:text-indigo-600 text-[10px] uppercase tracking-tighter">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-xl h-11"
                  {...register('password')}
                />
                {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="pb-8 flex flex-col gap-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-indigo-600/20 transition-all active:scale-95" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Sign In to Hub'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-[10px] font-bold text-slate-400 mt-8 uppercase tracking-[0.2em] px-8">
          Authorized Access Only
        </p>
      </motion.div>
    </div>
  );
}
