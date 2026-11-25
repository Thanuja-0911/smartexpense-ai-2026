import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  BarChart3,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/app/transactions', icon: Receipt },
    { name: 'Budgets', path: '/app/budgets', icon: PieChart },
    { name: 'Goals', path: '/app/goals', icon: Target },
    { name: 'AI Insights', path: '/app/ai-insights', icon: Sparkles },
    { name: 'Reports', path: '/app/reports', icon: BarChart3 },
    { name: 'Profile', path: '/app/profile', icon: User },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Slide-out Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 bg-slate-950 border-r border-slate-800 h-full p-6 flex flex-col z-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <span className="text-lg font-bold text-white">SmartExpense-AI</span>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar for Small Mobile Screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/app/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Receipt className="w-4 h-4" />
          <span>Transactions</span>
        </NavLink>
        <NavLink
          to="/app/budgets"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <PieChart className="w-4 h-4" />
          <span>Budgets</span>
        </NavLink>
        <NavLink
          to="/app/ai-insights"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Insights</span>
        </NavLink>
        <NavLink
          to="/app/reports"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reports</span>
        </NavLink>
      </nav>
    </>
  );
};
