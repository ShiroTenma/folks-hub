import React from 'react';
import { 
  Users, 
  CheckSquare, 
  PieChart, 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  Calendar,
  Receipt,
  X,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/useAuthStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { 
    icon: PieChart, 
    label: 'Finance', 
    path: '/finance',
    children: [
      { icon: BookOpen, label: 'Ledger', path: '/finance' },
      { icon: Calendar, label: 'Monthly Cash', path: '/finance/monthly' },
      { icon: Receipt, label: 'Split Bill', path: '/finance/split' },
    ]
  },
  { icon: Settings, label: 'Settings', path: '/settings', adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(
    location.pathname.startsWith('/finance') ? 'Finance' : null
  );

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) return;
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <>
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          {(!isCollapsed || !isOpen) && (
            <span className="ml-3 font-black text-white tracking-tighter text-xl">FOLKS<span className="text-indigo-500">HUB</span></span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-slate-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          const hasChildren = item.children && item.children.length > 0;
          const isOpenSub = openSubmenu === item.label;

          return (
            <div key={item.label} className="space-y-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                    isActive && !isOpenSub
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && !isOpenSub ? "text-white" : "group-hover:text-indigo-400")} />
                  {(!isCollapsed || !isOpen) && (
                    <>
                      <span className="font-bold text-sm tracking-tight flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpenSub && "rotate-180")} />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => { if (window.innerWidth < 768) onClose(); }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-indigo-400")} />
                  {(!isCollapsed || !isOpen) && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                  {isActive && (!isCollapsed || !isOpen) && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              )}

              {/* Submenu */}
              <AnimatePresence>
                {hasChildren && isOpenSub && (!isCollapsed || !isOpen) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 space-y-1"
                  >
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => { if (window.innerWidth < 768) onClose(); }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                            isChildActive 
                              ? "text-indigo-400 font-bold" 
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                          )}
                        >
                          <child.icon className={cn("h-4 w-4", isChildActive ? "text-indigo-400" : "group-hover:text-indigo-400")} />
                          <span className="text-xs font-bold tracking-tight">{child.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer / Toggle */}
      <div className="p-4 border-t border-slate-800 hidden md:block">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleCollapse}
          className="w-full justify-start text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl gap-3 h-11"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5 mx-auto" /> : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Collapse Sidebar</span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside 
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-slate-400 z-50 flex flex-col md:hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 text-slate-400 transition-all duration-300 z-40 hidden md:flex flex-col border-r border-slate-800",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
