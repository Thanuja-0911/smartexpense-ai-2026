import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sun, Moon, Calendar, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Header = ({ onPeriodChange, currentPeriod = 'this_month', onOpenMobileNav }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Budget Limit Alert', text: 'Food budget reaches 85% utilization', time: '10m ago' },
    { id: 2, title: 'Savings Milestone', text: 'New Laptop goal reached 30% target', time: '2h ago' },
    { id: 3, title: 'AI Insight Ready', text: 'Monthly spending analysis completed', time: '1d ago' },
  ];

  return (
    <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Drawer Trigger & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            Good day, {user?.name?.split(' ')[0] || 'User'} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Here's your personal financial overview.
          </p>
        </div>
      </div>

      {/* Right: Period selector, Theme Toggle, Notification Bell */}
      <div className="flex items-center gap-3">
        {/* Period Selector dropdown */}
        {onPeriodChange && (
          <div className="relative hidden md:block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <select
                value={currentPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="this_week" className="bg-slate-900">This Week</option>
                <option value="this_month" className="bg-slate-900">This Month</option>
                <option value="last_month" className="bg-slate-900">Last Month</option>
                <option value="this_year" className="bg-slate-900">This Year</option>
              </select>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-semibold text-slate-200">Notifications</h4>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">
                  3 New
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link */}
        <Link
          to="/app/profile"
          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-slate-200 text-xs overflow-hidden hover:border-brand-500/50 transition-all shrink-0 shadow-md"
          title="My Profile"
        >
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0) || 'U'
          )}
        </Link>
      </div>
    </header>
  );
};
