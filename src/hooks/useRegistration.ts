import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createNotification } from '@/lib/notifications';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  studentId: z.string().min(5, 'Student ID is required'),
  division: z.string().min(1, 'Please select a division'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const divisionParam = searchParams.get('division');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      division: divisionParam || '',
    }
  });

  const studentId = watch('studentId');

  useEffect(() => {
    if (studentId && studentId.length >= 5) {
      setValue('password', studentId);
    }
  }, [studentId, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } }
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: data.fullName,
          student_id: data.studentId,
          division: data.division,
          role: 'member',
          status: 'pending',
          batch: new Date().getFullYear().toString(),
          contact: data.email
        });

        await createNotification(
          'New Member Request',
          `${data.fullName} has requested to join ${data.division}. Approval required.`,
          'info'
        );

        toast.success('Registration request sent! Please wait for admin approval.');
        navigate('/login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    errors,
    isLoading,
    divisionParam
  };
}
