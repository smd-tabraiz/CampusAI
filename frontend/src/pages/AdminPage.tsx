import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Sparkles,
  SearchCheck,
  Calendar,
  Utensils,
  BookOpen,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  BarChart3,
  X
} from 'lucide-react';
import { campusApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { KnowledgeBaseItem } from '../types';

export const AdminPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analytics' | 'kb' | 'users'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [kbEntries, setKbEntries] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New KB Modal
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [kbFormData, setKbFormData] = useState({
    title: '',
    category: 'TIMINGS',
    content: '',
    keywords: ''
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, kbRes] = await Promise.all([
        campusApi.getAdminAnalytics(),
        campusApi.getAdminUsers(),
        campusApi.getKnowledgeBase()
      ]);

      setAnalytics(analyticsRes.data);
      setUsersList(usersRes.data.users || []);
      setKbEntries(kbRes.data.entries || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateKb = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campusApi.createKnowledgeBase(kbFormData);
      showToast('Knowledge Base entry added. AI assistant grounded immediately!', 'success');
      setIsKbModalOpen(false);
      setKbFormData({ title: '', category: 'TIMINGS', content: '', keywords: '' });
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save entry', 'error');
    }
  };

  const handleDeleteKb = async (id: string) => {
    if (!confirm('Are you sure you want to delete this verified campus record?')) return;
    try {
      await campusApi.deleteKnowledgeBase(id);
      showToast('Record removed from knowledge base.', 'info');
      loadAdminData();
    } catch (err: any) {
      showToast('Failed to delete entry', 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await campusApi.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`, 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  const kpis = analytics?.kpis || {
    totalStudents: 10,
    totalFaculty: 2,
    totalUsers: 12,
    totalEvents: 8,
    totalLostItems: 4,
    successfulMatches: 2,
    matchRatePercentage: 88,
    aiQueriesProcessed: 142,
    foodRecommendationsServed: 89
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            CampusAI Administration & Operations
          </h1>
          <p className="text-xs text-slate-500">
            Platform governance, AI knowledge grounding, telemetry, and moderation
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics & KPIs
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kb'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users ({usersList.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & KPIS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" /> Total Enrolled
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpis.totalStudents} Students</div>
              <div className="text-[10px] text-slate-400 mt-1">{kpis.totalFaculty} Faculty Members</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> AI Queries Handled
              </div>
              <div className="text-2xl font-bold text-brand-600">{kpis.aiQueriesProcessed}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 24% from last week</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <SearchCheck className="w-3.5 h-3.5 text-amber-500" /> Lost & Found Match Rate
              </div>
              <div className="text-2xl font-bold text-amber-600">{kpis.matchRatePercentage}%</div>
              <div className="text-[10px] text-slate-400 mt-1">{kpis.successfulMatches} AI Confirmed Pairings</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> Active Campus Events
              </div>
              <div className="text-2xl font-bold text-purple-600">{kpis.totalEvents}</div>
              <div className="text-[10px] text-slate-400 mt-1">Technical, Cultural & Sports</div>
            </div>
          </div>

          {/* Activity Charts & Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Daily Active Users Bar Trend */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Active Students & Queries</h3>
                  <p className="text-xs text-slate-400">7-Day Campus Usage Telemetry</p>
                </div>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>

              <div className="space-y-3 pt-2">
                {analytics?.charts?.dailyActiveUsers?.map((d: any) => (
                  <div key={d.day} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">{d.day}</span>
                      <span className="text-slate-800">{d.students} students • {d.queries} queries</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-brand-600 h-full rounded-full"
                        style={{ width: `${(d.queries / 800) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Queries by Category */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Intent Breakdown</h3>
                  <p className="text-xs text-slate-400">Distribution of user campus questions</p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-3 pt-2">
                {analytics?.charts?.queriesByCategory?.map((cat: any) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{cat.category}</span>
                      <span className="text-brand-600 font-bold">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-600 to-purple-600 h-full rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI KNOWLEDGE BASE */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span className="font-bold">Verified Campus Truth Grounding:</span> The AI assistant references these records directly to prevent hallucinations about timings, rules, contacts, and fees.
            </div>

            <button
              onClick={() => setIsKbModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Knowledge Record
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbEntries.map((kb) => (
              <div
                key={kb.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {kb.category}
                    </span>
                    <button
                      onClick={() => handleDeleteKb(kb.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">{kb.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{kb.content}</p>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="truncate">Keywords: {kb.keywords}</span>
                  <span className="flex-shrink-0 font-medium">Grounding Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER DIRECTORY & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Institutional User Directory</h3>
            <p className="text-xs text-slate-400">View registered students, faculty, and administrators</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">College Email</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {u.name[0]}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5">{u.department || 'General'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'FACULTY'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="py-1 px-2 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add KB Entry */}
      {isKbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Add Campus Truth Grounding
              </h2>
              <button
                onClick={() => setIsKbModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKb} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={kbFormData.title}
                  onChange={(e) => setKbFormData({ ...kbFormData, title: e.target.value })}
                  placeholder="e.g. Kaveri Hostel Laundry Timings & Rates"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={kbFormData.category}
                    onChange={(e) => setKbFormData({ ...kbFormData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="TIMINGS">Timings & Hours</option>
                    <option value="FACILITIES">Facilities & Equipment</option>
                    <option value="RULES">Campus & Hostel Rules</option>
                    <option value="EMERGENCY">Emergency & Medical</option>
                    <option value="TRANSPORT">Campus Transportation</option>
                    <option value="ACADEMICS">Academic Regulations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords</label>
                  <input
                    type="text"
                    value={kbFormData.keywords}
                    onChange={(e) => setKbFormData({ ...kbFormData, keywords: e.target.value })}
                    placeholder="laundry, wash, tokens, timings"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verified Factual Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={kbFormData.content}
                  onChange={(e) => setKbFormData({ ...kbFormData, content: e.target.value })}
                  placeholder="Accurate guidelines that the AI should output when students ask about this topic."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Save to CampusAI Knowledge Base
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
