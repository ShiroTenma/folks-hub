import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { DIVISIONS, APP_CONFIG } from '@/lib/constants';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  studentId: z.string().min(5, 'Student ID is required'),
  division: z.string().min(1, 'Please select a division'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile entry
        // Note: In production, this usually happens via a Supabase Trigger function
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: data.fullName,
            student_id: data.studentId,
            division: data.division,
            role: 'member', // Default role
            status: 'active',
            batch: new Date().getFullYear().toString(),
            contact: data.email
          });

        if (profileError) {
          console.warn('Profile creation error (might be handled by DB triggers):', profileError);
        }

        toast.success('Registration successful! Please check your email or login.');
        navigate('/login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-[0_8px_16px_rgba(79,70,229,0.25)]">
            <div className="w-6 h-6 border-4 border-white rounded-md"></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">JOIN {APP_CONFIG.NAME}</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Create your member account</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-1 pb-6 border-b border-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">New Registration</CardTitle>
            <CardDescription className="text-slate-500">Provide your information for organization access</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Full Name"
                    className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-xl h-11"
                    {...register('fullName')}
                  />
                  {errors.fullName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-xs font-bold uppercase tracking-widest text-slate-400">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="ID Number"
                    className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-xl h-11"
                    {...register('studentId')}
                  />
                  {errors.studentId && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.studentId.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-xs font-bold uppercase tracking-widest text-slate-400">Division</Label>
                <Select onValueChange={(val: string) => setValue('division', val)}>
                  <SelectTrigger className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-xl h-11">
                    <SelectValue placeholder="Select your division" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>{div}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.division && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.division.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">University Email</Label>
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
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-xl h-11"
                  {...register('password')}
                />
                {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-indigo-600/20 transition-all active:scale-95" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Register as Member'}
              </Button>
              <p className="text-xs text-slate-500 font-medium">
                Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
