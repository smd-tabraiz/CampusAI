import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SearchCheck,
  PlusCircle,
  Sparkles,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { campusApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LostItem, FoundItem, ItemMatch } from '../types';

export const LostFoundPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'matches' | 'lost' | 'found'>('matches');
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isReportLostOpen, setIsReportLostOpen] = useState(false);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'ELECTRONICS',
    description: '',
    color: 'Black',
    locationName: 'Anna Food Court',
    date: new Date().toISOString().split('T')[0],
    imageUrl: ''
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const [itemsRes, matchesRes] = await Promise.all([
        campusApi.getLostFound(),
        campusApi.getMatches().catch(() => ({ data: { matches: [] } }))
      ]);

      setLostItems(itemsRes.data.lostItems || []);
      setFoundItems(itemsRes.data.foundItems || []);
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    if (searchParams.get('action') === 'report_lost') {
      setIsReportLostOpen(true);
    } else if (searchParams.get('action') === 'report_found') {
      setIsReportFoundOpen(true);
    }
  }, [searchParams]);

  const handleReportLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      const res = await campusApi.reportLost({
        ...formData,
        lostDate: formData.date
      });

      showToast('Lost item reported. AI matching engine initiated!', 'success');
      setIsReportLostOpen(false);
      loadItems();
      setActiveTab('matches');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit report', 'error');
    }
  };

  const handleReportFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      const res = await campusApi.reportFound({
        ...formData,
        foundDate: formData.date
      });

      showToast('Found item registered. Matching against active lost reports!', 'success');
      setIsReportFoundOpen(false);
      loadItems();
      setActiveTab('matches');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to register found item', 'error');
    }
  };

  const categories = [
    'ELECTRONICS',
    'ID_CARDS',
    'WALLETS_BAGS',
    'BOOKS_STATIONERY',
    'KEYS',
    'ACCESSORIES',
    'OTHER'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SearchCheck className="w-6 h-6 text-amber-500" />
            Lost & Found AI Matching
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent semantic matching across descriptions, locations, colors, and timestamps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportLostOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost Item
          </button>

          <button
            onClick={() => setIsReportFoundOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Report Found Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'matches'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            AI Potential Matches ({matches.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'lost'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Reported Lost ({lostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'found'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Turned-In / Found ({foundItems.length})
        </button>
      </div>

      {/* TAB CONTENT: AI Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold">Automated Semantic Cross-Correlation:</span> When a student reports a lost or found item, CampusAI analyzes title keywords, category, color tokens, and campus zone proximity to surface high-confidence pairings.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {match.lostItem.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {match.confidenceScore}% Match Confidence
                    </span>
                  </div>

                  {/* Comparison Side-by-Side */}
                  <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-xl bg-slate-50 text-xs">
                    <div className="border-r border-slate-200 pr-2">
                      <div className="text-[10px] uppercase font-bold text-rose-600 mb-1">Lost Item</div>
                      <div className="font-bold text-slate-900">{match.lostItem.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">📍 {match.lostItem.locationName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Color: {match.lostItem.color}</div>
                    </div>
                    <div className="pl-1">
                      <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Found Item</div>
                      <div className="font-bold text-slate-900">{match.foundItem.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">📍 {match.foundItem.locationName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Color: {match.foundItem.color}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 mb-4 leading-relaxed">
                    <span className="font-semibold text-amber-900">Why this match:</span> {match.matchReason}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safe Verification Flow
                  </span>
                  <button
                    onClick={() => showToast('Claim request routed to Central Campus Security Desk.', 'success')}
                    className="py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Verify & Claim
                  </button>
                </div>
              </div>
            ))}

            {matches.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-400">
                <SearchCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <div className="text-sm font-semibold">No Pending Matches</div>
                <p className="text-xs text-slate-400 mt-1">
                  When matching lost and found reports are submitted, they will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Lost Items */}
      {activeTab === 'lost' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lostItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                  Lost • {item.category}
                </span>
                <span className="text-xs text-slate-400">{item.lostDate}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.description}</p>
              <div className="text-xs text-slate-600 mb-3">📍 {item.locationName} • Color: {item.color}</div>
              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Reported by: {item.user?.name || 'Student'}</span>
                <span className="font-semibold text-rose-600">Active Search</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Found Items */}
      {activeTab === 'found' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {foundItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Found • {item.category}
                </span>
                <span className="text-xs text-slate-400">{item.foundDate}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.description}</p>
              <div className="text-xs text-slate-600 mb-3">📍 Location: {item.locationName}</div>
              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Custodian: {item.contactMethod}</span>
                <span className="font-semibold text-emerald-600">Ready for Claim</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Report Lost Item */}
      {isReportLostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SearchCheck className="w-4 h-4 text-amber-600" />
                Report a Lost Item
              </h2>
              <button
                onClick={() => setIsReportLostOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportLostSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Black JBL Wireless Headphones"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Matte Black"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approximate Location</label>
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g. Anna Food Court Table 14"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Lost</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Include identifying marks, model numbers, stickers, etc."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Submit Report & Search Matches
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Report Found Item */}
      {isReportFoundOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SearchCheck className="w-4 h-4 text-emerald-600" />
                Register a Found Item
              </h2>
              <button
                onClick={() => setIsReportFoundOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportFoundSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Over-Ear Wireless Headphones in pouch"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Black"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Found Location</label>
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g. Anna Food Court"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Found</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description & Details</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Where the item was turned in (e.g. Handed over to Library Security Desk)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Register Found Item Notice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
