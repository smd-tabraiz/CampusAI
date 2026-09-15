import React, { useState, useEffect } from 'react';
import {
  Users2,
  Sparkles,
  Sliders,
  CheckCircle2,
  Heart,
  Send,
  Building,
  Moon,
  Sun,
  Shield,
  BookOpen,
  DollarSign,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { campusApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RoommateProfile } from '../types';

export const RoommatePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [matches, setMatches] = useState<RoommateProfile[]>([]);
  const [myProfile, setMyProfile] = useState<RoommateProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RoommateProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Questionnaire form state
  const [formData, setFormData] = useState({
    preferredHostel: 'Kaveri Hostel',
    roomType: 'DOUBLE',
    sleepSchedule: 'NIGHT_OWL',
    studyHabits: 'BALANCED',
    cleanliness: 'METICULOUS',
    foodPreference: 'VEGETARIAN',
    noiseTolerance: 'MEDIUM',
    smokingPreference: 'NON_SMOKER',
    pets: 'NO_PETS',
    socialPreference: 'AMBIVERT',
    budget: 8000,
    bio: ''
  });

  const loadRoommateData = async () => {
    setLoading(true);
    try {
      const [profileRes, matchesRes] = await Promise.all([
        campusApi.getRoommateProfile().catch(() => ({ data: { profile: null } })),
        campusApi.getRoommateMatches().catch(() => ({ data: { matches: [] } }))
      ]);

      if (profileRes.data.profile) {
        setMyProfile(profileRes.data.profile);
        setFormData({
          preferredHostel: profileRes.data.profile.preferredHostel,
          roomType: profileRes.data.profile.roomType,
          sleepSchedule: profileRes.data.profile.sleepSchedule,
          studyHabits: profileRes.data.profile.studyHabits,
          cleanliness: profileRes.data.profile.cleanliness,
          foodPreference: profileRes.data.profile.foodPreference,
          noiseTolerance: profileRes.data.profile.noiseTolerance,
          smokingPreference: profileRes.data.profile.smokingPreference,
          pets: profileRes.data.profile.pets,
          socialPreference: profileRes.data.profile.socialPreference,
          budget: profileRes.data.profile.budget,
          bio: profileRes.data.profile.bio
        });
      }

      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error('Failed to load roommate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoommateData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await campusApi.saveRoommateProfile(formData);
      setMyProfile(res.data.profile);
      setIsEditingProfile(false);
      showToast('Roommate preferences saved! AI matching updated.', 'success');
      loadRoommateData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save profile', 'error');
    }
  };

  const handleSendConnection = async () => {
    if (!selectedCandidate) return;
    try {
      await campusApi.connectRoommate(selectedCandidate.userId, connectMessage);
      showToast(`Connection request sent to ${selectedCandidate.user?.name}!`, 'success');
      setIsConnectModalOpen(false);
      setConnectMessage('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to send request', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-indigo-600" />
            AI Roommate Matcher
          </h1>
          <p className="text-xs text-slate-500">
            5-dimensional compatibility analysis: study habits, sleep schedules, cleanliness, budget, and lifestyle
          </p>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-sm self-start"
        >
          <Sliders className="w-4 h-4" />
          {myProfile ? 'Edit Lifestyle Preferences' : 'Set Up Preferences'}
        </button>
      </div>

      {/* QUESTIONNAIRE EDITOR MODAL / SECTION */}
      {isEditingProfile && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">12-Factor Roommate Questionnaire</h2>
              <p className="text-xs text-slate-500">Used by AI to find your highest-compatibility roommate</p>
            </div>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Hostel</label>
              <select
                value={formData.preferredHostel}
                onChange={(e) => setFormData({ ...formData, preferredHostel: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Kaveri Hostel">Kaveri Boys Hostel Block A</option>
                <option value="Ganga Hostel">Ganga Girls Hostel Block B</option>
                <option value="Yamuna Hostel">Yamuna Hostel Block C</option>
                <option value="Brahmaputra Hostel">Brahmaputra International Hostel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Occupancy</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="SINGLE">Single Occupancy</option>
                <option value="DOUBLE">Double Sharing</option>
                <option value="TRIPLE">Triple Sharing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sleep Schedule</label>
              <select
                value={formData.sleepSchedule}
                onChange={(e) => setFormData({ ...formData, sleepSchedule: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="NIGHT_OWL">Night Owl (1 AM - 9 AM)</option>
                <option value="EARLY_BIRD">Early Bird (10 PM - 6 AM)</option>
                <option value="FLEXIBLE">Flexible / Varies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Study Habits</label>
              <select
                value={formData.studyHabits}
                onChange={(e) => setFormData({ ...formData, studyHabits: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="SILENT_SOLO">Silent Solo Studying</option>
                <option value="BALANCED">Balanced (Music / Lo-fi ok)</option>
                <option value="GROUP_STUDY">Group Discussion / Collaborative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cleanliness Style</label>
              <select
                value={formData.cleanliness}
                onChange={(e) => setFormData({ ...formData, cleanliness: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="METICULOUS">Meticulous (Daily tidy, organized desk)</option>
                <option value="MODERATE">Moderate (Weekly cleaning)</option>
                <option value="RELAXED">Relaxed / Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Food / Dietary</label>
              <select
                value={formData.foodPreference}
                onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="VEGETARIAN">Pure Vegetarian</option>
                <option value="ANY">Any / Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="JAIN">Jain Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Noise Tolerance</label>
              <select
                value={formData.noiseTolerance}
                onChange={(e) => setFormData({ ...formData, noiseTolerance: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="LOW">Low (Prefer quiet room)</option>
                <option value="MEDIUM">Medium (Normal conversation ok)</option>
                <option value="HIGH">High (Music & visitors ok)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Smoking Preference</label>
              <select
                value={formData.smokingPreference}
                onChange={(e) => setFormData({ ...formData, smokingPreference: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="NON_SMOKER">Strict Non-Smoker</option>
                <option value="OUTSIDE_ONLY">Outside Hostel Premises Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Hostel Budget (₹)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value, 10) || 8000 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personal Bio & Notes for Prospective Roommates
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your interests, hobbies, study schedule, or anything you value in a room partner."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-2">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                Save Preferences & Run Matching Algorithm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidate Matches Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            High-Compatibility Candidates ({matches.length})
          </div>
          <span className="text-xs text-slate-500">Sorted by 5-Factor Synergy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((cand) => {
            const isExpanded = expandedId === cand.id;
            const score = cand.compatibilityScore || 85;

            return (
              <div
                key={cand.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                        {cand.user?.name ? cand.user.name[0] : 'R'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{cand.user?.name}</h3>
                        <div className="text-xs text-slate-500">
                          {cand.department} • Year {cand.year}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-200">
                        {score}% Match
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      🏢 {cand.preferredHostel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      🌙 {cand.sleepSchedule.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      🧹 {cand.cleanliness}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      💰 ₹{cand.budget}/mo
                    </span>
                  </div>

                  {/* Why Match Natural Language */}
                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 mb-3 leading-relaxed">
                    💡 <span className="font-semibold">Why you match:</span> {cand.whyMatch}
                  </div>

                  {/* Expandable 5-Factor Breakdown */}
                  {isExpanded && cand.breakdown && (
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-3 animate-in fade-in duration-150">
                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                        Compatibility Breakdown
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-600">Sleep Schedule</span>
                          <span className="font-bold text-slate-800">{cand.breakdown.sleepSchedule}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${cand.breakdown.sleepSchedule}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-600">Study Habits</span>
                          <span className="font-bold text-slate-800">{cand.breakdown.studyHabits}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${cand.breakdown.studyHabits}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-600">Cleanliness & Living</span>
                          <span className="font-bold text-slate-800">{cand.breakdown.cleanliness}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${cand.breakdown.cleanliness}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-600">Budget Range</span>
                          <span className="font-bold text-slate-800">{cand.breakdown.budget}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${cand.breakdown.budget}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : cand.id)}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-3"
                  >
                    {isExpanded ? (
                      <>Hide Breakdown <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>View 5-Dimension Compatibility Scores <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" /> Private In-App Connection
                  </span>

                  <button
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setIsConnectModalOpen(true);
                    }}
                    className="py-1.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Connect Request
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONNECT REQUEST MODAL */}
      {isConnectModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-600" />
                Connect with {selectedCandidate.user?.name}
              </h2>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                Send an introduction message to discuss room allotment in{' '}
                <span className="font-bold">{selectedCandidate.preferredHostel}</span>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Introduction Note
                </label>
                <textarea
                  rows={3}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Hey! Saw we matched on sleep schedule and study habits. Would you be interested in pairing for room allotment?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendConnection}
                  className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow transition-colors"
                >
                  Send Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
