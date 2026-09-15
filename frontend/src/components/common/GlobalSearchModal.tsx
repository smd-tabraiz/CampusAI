import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Utensils, AlertCircle, X, ArrowRight, Sparkles } from 'lucide-react';
import { campusApi } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    locations: any[];
    events: any[];
    food: any[];
    lostFound: any[];
  }>({
    locations: [],
    events: [],
    food: [],
    lostFound: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ locations: [], events: [], food: [], lostFound: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [locRes, eventRes, foodRes] = await Promise.all([
          campusApi.searchLocations(query),
          campusApi.getEvents({ search: query }),
          campusApi.getFoodRecommendations({ search: query })
        ]);

        setResults({
          locations: locRes.data.locations || [],
          events: eventRes.data.events || [],
          food: foodRes.data.recommendations || [],
          lostFound: []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform scale-100 transition-all">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything on campus (locations, food, events, facilities)..."
            autoFocus
            className="w-full text-base text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0 font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-3 text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-indigo-600 gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium text-slate-500">Searching campus directory...</span>
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-slate-400">
              <p className="text-sm font-medium">Quick suggestions:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Central Library', 'Anna Food Court', 'Computer Science Block', 'Hackathons', 'Printing Kiosk'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && (
            <>
              {/* Locations */}
              {results.locations.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    Campus Locations ({results.locations.length})
                  </div>
                  <div className="space-y-1">
                    {results.locations.slice(0, 3).map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => {
                          onClose();
                          navigate(`/navigation?dest=${loc.id}`);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/60 cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                            {loc.name}
                          </div>
                          <div className="text-xs text-slate-500">{loc.category} • {loc.openingHours}</div>
                        </div>
                        <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Directions <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    Upcoming Events ({results.events.length})
                  </div>
                  <div className="space-y-1">
                    {results.events.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          onClose();
                          navigate('/events');
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50/60 cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-purple-600">
                            {ev.title}
                          </div>
                          <div className="text-xs text-slate-500">{ev.date} • {ev.locationName}</div>
                        </div>
                        <span className="text-xs font-medium text-purple-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Event <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Food */}
              {results.food.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                    Food & Cafeterias ({results.food.length})
                  </div>
                  <div className="space-y-1">
                    {results.food.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onClose();
                          navigate('/food');
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600">
                            {item.name} — ₹{item.price}
                          </div>
                          <div className="text-xs text-slate-500">{item.cafeteria?.name} • {item.isVeg ? 'Veg' : 'Non-Veg'}</div>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Menu <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.locations.length === 0 && results.events.length === 0 && results.food.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No results found for "{query}".</p>
                  <p className="text-xs text-slate-400 mt-1">Try asking the AI Assistant for natural language assistance.</p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/assistant?q=${encodeURIComponent(query)}`);
                    }}
                    className="mt-3 px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Ask CampusAI Assistant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
