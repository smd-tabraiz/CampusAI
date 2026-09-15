import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, GraduationCap, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemo = async (role: 'student' | 'faculty' | 'admin') => {
    setSubmitting(true);
    const success = await demoLogin(role);
    setSubmitting(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 text-white shadow-xl shadow-brand-500/25 mb-4 transform hover:scale-105 transition-transform">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          CampusAI
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Your Intelligent Campus Companion
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {/* Quick Demo Credentials Access */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              1-Click Demo Evaluation Logins
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Instant login with seeded realistic campus profiles:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('student')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all shadow-xs text-indigo-950 disabled:opacity-60"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold">Student</span>
                <span className="text-[9px] text-slate-400">Alex</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('faculty')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all shadow-xs text-indigo-950 disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-[11px] font-bold">Faculty</span>
                <span className="text-[9px] text-slate-400">Dr. Rajesh</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('admin')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all shadow-xs text-indigo-950 disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-slate-400">Vikram</span>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-medium uppercase">Or Sign In with Email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                College Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {submitting ? 'Authenticating...' : 'Sign In to CampusAI'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            New student or faculty?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an institutional account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
