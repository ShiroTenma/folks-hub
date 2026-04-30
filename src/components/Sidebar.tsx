import React from 'react';
import { 
  Users, 
  Settings, 
  CheckSquare, 
  PieChart, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: PieChart, label: 'Finance', path: '/finance' },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-900 text-slate-400 transition-all duration-300 z-40 hidden md:flex flex-col border-r border-slate-800",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
          <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
        </div>
        {!isCollapsed && (
          <span className="ml-3 font-black text-white tracking-tighter text-xl">FOLKS<span className="text-indigo-500">HUB</span></span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-indigo-400")} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Toggle */}
      <div className="p-4 border-t border-slate-800">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-start text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl gap-3"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5 mx-auto" /> : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Collapse View</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

import { motion } from 'motion/react';
