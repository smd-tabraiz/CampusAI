import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Ticket,
  Calendar,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { campusApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CampusEvent } from '../types';

export const EventsPage: React.FC = () => {
  const { user, isFaculty } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Event Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    date: '2026-09-15',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    locationName: 'Nalanda Main Auditorium',
    maxParticipants: 150,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await campusApi.getEvents({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchQuery || undefined
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const handleRsvp = async (eventId: string) => {
    try {
      const res = await campusApi.rsvpEvent(eventId);
      if (res.data.isRegistered) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
        showToast('🎟️ Registered! Confirmation added to notifications.', 'success');
      } else {
        showToast('RSVP cancelled.', 'info');
      }
      loadEvents();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to RSVP', 'error');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campusApi.createEvent(formData);
      showToast('Event published to campus calendar!', 'success');
      setIsCreateModalOpen(false);
      loadEvents();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create event', 'error');
    }
  };

  const categories = [
    { label: 'All Events', value: 'ALL' },
    { label: 'Technical & AI', value: 'TECHNICAL' },
    { label: 'Hackathons', value: 'HACKATHONS' },
    { label: 'Workshops', value: 'WORKSHOPS' },
    { label: 'Cultural Fests', value: 'CULTURAL' },
    { label: 'Sports', value: 'SPORTS' },
    { label: 'Competitions', value: 'COMPETITIONS' },
    { label: 'Placement Prep', value: 'PLACEMENT' },
    { label: 'Clubs & Arts', value: 'CLUBS' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600" />
            Campus Events & Discovery
          </h1>
          <p className="text-xs text-slate-500">
            Personalized hackathons, tech symposiums, sports cups, and cultural fests
          </p>
        </div>

        {isFaculty && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-sm self-start"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event Notice
          </button>
        )}
      </div>

      {/* Search & Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events (e.g., 'HackCampus', 'Drone Workshop', 'Tarangini', 'Football')..."
            className="w-full pl-10 pr-24 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Event Image Banner */}
              <div className="relative h-44 w-full bg-slate-100">
                <img
                  src={ev.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  {ev.category}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/95 text-purple-700 text-[10px] font-bold shadow">
                  {ev.isFree ? 'Free Entry' : 'Paid Entry'}
                </span>
              </div>

              {/* Event Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {ev.date} • {ev.startTime}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">{ev.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{ev.description}</p>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium truncate">{ev.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Users className="w-3.5 h-3.5" />
                    <span>Organized by: {ev.organizerName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
              <span className="text-xs text-slate-400 font-medium">
                {ev.rsvpsCount || 0} Registered
              </span>

              <button
                onClick={() => handleRsvp(ev.id)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  ev.isUserRegistered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                }`}
              >
                {ev.isUserRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> RSVP Confirmed
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" /> RSVP Now
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-span-3 py-16 text-center text-slate-400">
            <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <div className="text-sm font-semibold">No events found</div>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or searching for a different topic.</p>
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL (Faculty / Admin) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-purple-600" />
                Publish Campus Event
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AI Symposium 2026"
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
                    {categories.filter((c) => c.value !== 'ALL').map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Location</label>
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="Nalanda Auditorium"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key topics, speakers, registration requirements..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
