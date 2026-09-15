import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Sparkles, Utensils, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/navigation"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span>Map</span>
      </NavLink>

      {/* Floating Center AI Assistant Button */}
      <NavLink
        to="/assistant"
        className="flex flex-col items-center -mt-5 group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-700 via-brand-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-brand-600 mt-1">AI</span>
      </NavLink>

      <NavLink
        to="/food"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Utensils className="w-5 h-5" />
        <span>Food</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
