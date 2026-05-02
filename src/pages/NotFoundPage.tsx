import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="w-24 h-24 bg-[#eae6e0] text-[#1c1c1c] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-[#1c1c1c] tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-[#1c1c1c]">Page Not Found</h2>
          <p className="text-[#535366]/60 max-w-md mx-auto font-medium">
            The page you are looking for doesn't exist or has been moved to another URL.
          </p>
        </div>

        <Button 
          onClick={() => navigate('/')}
          className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-bold rounded-xl px-8 h-12 gap-2 shadow-lg shadow-black/10 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          BACK TO DASHBOARD
        </Button>
      </motion.div>
    </div>
  );
}
