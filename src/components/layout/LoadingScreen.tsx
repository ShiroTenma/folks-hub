import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 space-y-4 flex-col bg-slate-50">
      <div className="relative">
        <Skeleton className="w-[80px] h-[80px] rounded-2xl bg-slate-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="space-y-3 flex flex-col items-center">
        <Skeleton className="h-4 w-[180px] bg-slate-200" />
        <Skeleton className="h-3 w-[120px] bg-slate-200 opacity-60" />
      </div>
    </div>
  );
}
