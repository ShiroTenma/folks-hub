import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 space-y-4 flex-col bg-[#f4f2ef]/50">
      <div className="relative">
        <Skeleton className="w-[80px] h-[80px] rounded-2xl bg-[#eae6e0]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1c1c1c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="space-y-3 flex flex-col items-center">
        <Skeleton className="h-4 w-[180px] bg-[#eae6e0]" />
        <Skeleton className="h-3 w-[120px] bg-[#eae6e0] opacity-60" />
      </div>
    </div>
  );
}
