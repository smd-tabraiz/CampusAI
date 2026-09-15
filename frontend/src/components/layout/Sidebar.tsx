import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  SearchCheck,
  Utensils,
  Users2,
  CalendarDays,
  Bell,
  ShieldAlert,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
    { to: '/navigation', label: 'Campus Map', icon: Compass },
    { to: '/lost-found', label: 'Lost & Found', icon: SearchCheck },
    { to: '/food', label: 'Smart Cafeteria', icon: Utensils },
    { to: '/roommate', label: 'Roommate Matcher', icon: Users2 },
    { to: '/events', label: 'Events & Fests', icon: CalendarDays },
    { to: '/notifications', label: 'Notifications', icon: Bell }
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Hub', icon: ShieldAlert, badge: 'PRO' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm tracking-tight">CampusAI</span>
                <p className="text-[10px] text-slate-400 font-medium">Hyperlocal Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Campus Intelligence
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/5'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        item.badge === 'AI'
                          ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-xs'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Campus Status Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-800">Campus Systems Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Dr. A.P.J. Kalam Central Library & Anna Food Court currently open.
            </p>
          </div>

          {user && (
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full bg-indigo-100 object-cover"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.department || user.role}</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
