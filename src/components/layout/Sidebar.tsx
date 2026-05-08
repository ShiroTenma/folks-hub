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
  Settings,
  Sparkles
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
  const isAdmin = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin');

  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(
    location.pathname.startsWith('/finance') ? 'Finance' : null
  );

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) return;
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#1c1c1c] text-[#eae6e0]">
      {/* Brand Logo */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#535366] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-black/40 border border-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          {(!isCollapsed || !isOpen) && (
            <div className="flex flex-col">
              <span className="font-heading font-black text-[#ffffff] tracking-tight text-xl leading-none italic">FOLKS<span className="text-[#535366] not-italic">Hub</span></span>
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-[#535366] mt-1">Management</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white/40 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
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
                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative font-sans",
                    isActive && !isOpenSub
                      ? "bg-[#535366] text-white shadow-xl shadow-black/20"
                      : "hover:bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && !isOpenSub ? "text-white" : "text-[#535366] group-hover:text-white")} />
                  {(!isCollapsed || !isOpen) && (
                    <>
                      <span className="font-bold text-sm tracking-wide flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("h-4 w-4 opacity-40 transition-transform duration-300", isOpenSub && "rotate-180")} />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => { if (window.innerWidth < 768) onClose(); }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative font-sans",
                    isActive
                      ? "bg-[#535366] text-white shadow-xl shadow-black/20"
                      : "hover:bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-[#535366] group-hover:text-white")} />
                  {(!isCollapsed || !isOpen) && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                  {isActive && (!isCollapsed || !isOpen) && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"
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
                    className="overflow-hidden pl-11 space-y-1 mt-1"
                  >
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => { if (window.innerWidth < 768) onClose(); }}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group font-sans",
                            isChildActive
                              ? "text-white font-bold"
                              : "text-white/30 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{child.label}</span>
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
      <div className="p-6 border-t border-white/5 hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full justify-start text-white/30 hover:text-white hover:bg-white/5 rounded-2xl gap-4 h-14 transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight className="h-6 w-6 mx-auto" /> : (
            <>
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                <ChevronLeft className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">Minimize</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-80 z-50 flex flex-col md:hidden"
      >
        {sidebarContent}
      </motion.aside>

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen transition-all duration-500 z-40 hidden md:flex flex-col border-r border-white/5",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
