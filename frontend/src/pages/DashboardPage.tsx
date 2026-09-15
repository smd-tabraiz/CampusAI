import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Compass,
  SearchCheck,
  CalendarDays,
  Utensils,
  Users2,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Building,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { campusApi } from '../services/api';
import { CampusEvent, Cafeteria, RoommateProfile } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState('');
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
  const [stats, setStats] = useState({
    eventsToday: 2,
    openFacilities: 8,
    lostItems: 3,
    cafeteriasOpen: 5
  });

  // Dynamic greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const studentFirstName = user ? user.name.split(' ')[0] : 'Student';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventRes, cafeRes, rmRes] = await Promise.all([
          campusApi.getEvents({ filter: 'upcoming' }),
          campusApi.getCafeterias(),
          campusApi.getRoommateMatches().catch(() => ({ data: { matches: [] } }))
        ]);

        setEvents(eventRes.data.events?.slice(0, 2) || []);
        setCafeterias(cafeRes.data.cafeterias?.slice(0, 3) || []);
        setRoommates(rmRes.data.matches?.slice(0, 2) || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadDashboardData();
  }, []);

  const handleAiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/assistant?q=${encodeURIComponent(aiQuery.trim())}`);
  };

  const handleSuggestionClick = (queryText: string) => {
    navigate(`/assistant?q=${encodeURIComponent(queryText)}`);
  };

  const quickActions = [
    {
      title: 'AI Assistant',
      desc: 'Hyperlocal queries',
      icon: Sparkles,
      color: 'from-brand-600 to-indigo-600 text-white',
      route: '/assistant',
      isPrimary: true
    },
    {
      title: 'Campus Map',
      desc: 'Interactive 3D paths',
      icon: Compass,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      route: '/navigation'
    },
    {
      title: 'Lost & Found',
      desc: 'AI semantic match',
      icon: SearchCheck,
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      route: '/lost-found'
    },
    {
      title: 'Events & Fests',
      desc: 'Hackathons & clubs',
      icon: CalendarDays,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      route: '/events'
    },
    {
      title: 'Smart Cafeteria',
      desc: 'Budget & veg food',
      icon: Utensils,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      route: '/food'
    },
    {
      title: 'Roommate Match',
      desc: '90%+ compatibility',
      icon: Users2,
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
      route: '/roommate'
    }
  ];

  const suggestions = [
    'Find the nearest library',
    "What's happening today?",
    'Where can I get lunch?',
    'I lost my ID card',
    'Find a roommate'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-900 text-white p-6 sm:p-10 shadow-2xl border border-indigo-900/40">
        {/* Subtle decorative glowing background blur */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Campus Life Engine Online
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
            {getGreeting()}, {studentFirstName} 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-normal mb-8">
            What can I help you find on campus today?
          </p>

          {/* Large AI Search/Chat Input */}
          <form onSubmit={handleAiSearchSubmit} className="relative mb-4">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-1.5 focus-within:ring-4 focus-within:ring-brand-400/30 transition-all">
              <Sparkles className="w-5 h-5 text-brand-600 ml-3.5 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask anything about your campus (e.g., 'Find food under ₹100', 'Directions to CS Lab')..."
                className="w-full py-2.5 px-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Try asking:</span>
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Quick Actions</h2>
          <span className="text-xs text-slate-400 font-medium">Core Campus Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.route)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  action.isPrimary
                    ? 'bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-brand-500 shadow-brand-500/20 shadow-md'
                    : 'bg-white border-slate-200/80 hover:border-brand-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    action.isPrimary ? 'bg-white/20 text-white' : action.color
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className={`text-sm font-bold leading-tight ${
                    action.isPrimary ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {action.title}
                </div>
                <div
                  className={`text-[11px] mt-1 ${
                    action.isPrimary ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {action.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Campus Overview Counters */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.eventsToday}</div>
            <div className="text-xs text-slate-500 font-medium">Events Today</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.openFacilities}</div>
            <div className="text-xs text-slate-500 font-medium">Open Facilities</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <SearchCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.lostItems}</div>
            <div className="text-xs text-slate-500 font-medium">Active Lost Items</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.cafeteriasOpen}</div>
            <div className="text-xs text-slate-500 font-medium">Cafeterias Open</div>
          </div>
        </div>
      </section>

      {/* Recommended for You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recommended for You</h2>
            <p className="text-xs text-slate-500">
              Personalized based on your department ({user?.department || 'Computer Science'}) and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recommended Event */}
          {events.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={events[0].imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'}
                    alt={events[0].title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    {events[0].category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {events[0].date} • {events[0].startTime}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{events[0].title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{events[0].description}</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate('/events')}
                  className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  View Details & RSVP <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Recommended Food Item / Cafeteria */}
          {cafeterias.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={cafeterias[0].imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                    alt={cafeterias[0].name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    Top Rated Cafeteria
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">{cafeterias[0].name}</h3>
                    <span className="text-xs font-bold text-amber-600">★ {cafeterias[0].rating}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">📍 {cafeterias[0].locationName}</div>
                  <div className="p-2 rounded-xl bg-emerald-50 text-[11px] text-emerald-800 font-medium leading-relaxed">
                    💡 Healthy meals & authentic South Indian dosa specials starting from ₹40.
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate('/food')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  Explore Menus <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Recommended Roommate Match */}
          {roommates.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    High Compatibility Match
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    {roommates[0].compatibilityScore || 94}% Match
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-base">
                    {roommates[0].user?.name ? roommates[0].user.name[0] : 'K'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{roommates[0].user?.name}</h3>
                    <div className="text-xs text-slate-500">
                      {roommates[0].preferredHostel} • {roommates[0].department}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl mb-2">
                  "{roommates[0].whyMatch || 'Shares your night owl study hours and clean living preference.'}"
                </p>
              </div>

              <button
                onClick={() => navigate('/roommate')}
                className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
              >
                View Compatibility Breakdown <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-center">
              <div>
                <Users2 className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 text-sm mb-1">Find Your Ideal Roommate</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Complete our 5-factor questionnaire to match with students in Kaveri and Ganga hostels.
                </p>
              </div>
              <button
                onClick={() => navigate('/roommate')}
                className="py-2 px-3 rounded-xl bg-brand-600 text-white font-semibold text-xs transition-colors"
              >
                Set Roommate Preferences
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
