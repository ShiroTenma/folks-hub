import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthListener() {
  const { setUser, setProfile, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, fetchProfile]);

  // Handle local loading state based on profile existence
  useEffect(() => {
    const { profile, user } = useAuthStore.getState();
    if (user && profile) {
      setIsLoading(false);
    } else if (!user) {
      setIsLoading(false);
    }
  }, []);

  // We actually need a more robust way to signal loading end from the store
  return { isLoading };
}
