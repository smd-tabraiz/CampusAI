import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Calendar, Utensils, AlertTriangle, Users, ArrowRight, ShieldAlert, Phone, CheckCircle } from 'lucide-react';

interface ChatCardsProps {
  cards: { type: string; data: any }[];
}

export const ChatCards: React.FC<ChatCardsProps> = ({ cards }) => {
  const navigate = useNavigate();

  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
      {cards.map((card, idx) => {
        switch (card.type) {
          case 'navigation_route':
            return (
              <div
                key={idx}
                className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-indigo-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs tracking-wider uppercase">
                    <Navigation className="w-4 h-4 text-indigo-400" />
                    Recommended Walking Route
                  </div>
                  {card.data.accessibleRoute && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                      ♿ Accessible Path
                    </span>
                  )}
                </div>

                <div className="text-lg font-bold mb-1">{card.data.destination}</div>
                <div className="text-xs text-slate-300 mb-3">
                  {card.data.category} • Hours: {card.data.openingHours}
                </div>

                <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-white/10 backdrop-blur-sm mb-3">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-medium">Distance</div>
                    <div className="text-sm font-bold text-white">{card.data.distance}</div>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-medium">Est. Walk</div>
                    <div className="text-sm font-bold text-indigo-300">{card.data.estimatedWalkingMinutes} mins</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/navigation?dest=${card.data.code}`)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all duration-200"
                >
                  Open in Interactive Map <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );

          case 'location':
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {card.data.category || 'Location'}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{card.data.name}</div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{card.data.description}</p>
                </div>
                <button
                  onClick={() => navigate(`/navigation?search=${encodeURIComponent(card.data.name)}`)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start"
                >
                  View on Campus Map <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );

          case 'event':
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-purple-100 text-purple-700">
                      {card.data.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {card.data.date}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{card.data.title}</div>
                  <div className="text-xs text-slate-500 mb-3">📍 {card.data.locationName}</div>
                </div>
                <button
                  onClick={() => navigate('/events')}
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  Event Details & RSVP <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );

          case 'food':
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-slate-900">₹{card.data.price}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      card.data.isVeg ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {card.data.isVeg ? 'Pure Veg' : 'Non-Veg'}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{card.data.name}</div>
                  <div className="text-xs text-slate-500 mb-2">
                    🍽️ {card.data.cafeteria?.name || 'Anna Food Court'}
                  </div>
                  {card.data.whyRecommended && (
                    <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed mb-3">
                      💡 {card.data.whyRecommended}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/food')}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                >
                  View Cafeteria Menu
                </button>
              </div>
            );

          case 'lost_found_match':
            return (
              <div
                key={idx}
                className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 text-amber-900">
                      {card.data.confidenceScore}% Match
                    </span>
                    <span className="text-xs text-amber-800 font-medium">Found Item</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{card.data.title}</div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{card.data.description}</p>
                  <div className="text-xs text-slate-500 mb-3">
                    📍 {card.data.locationName} • {card.data.foundDate}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/lost-found')}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  View Claim Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );

          case 'roommate':
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                    {card.data.user?.name ? card.data.user.name[0] : 'R'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{card.data.user?.name}</div>
                    <div className="text-xs text-slate-500">
                      {card.data.preferredHostel} • Year {card.data.year}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-lg">
                      {card.data.compatibilityScore}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg mb-3">
                  "{card.data.whyMatch}"
                </div>
                <button
                  onClick={() => navigate('/roommate')}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                >
                  Connect on Roommate Hub
                </button>
              </div>
            );

          case 'emergency':
            return (
              <div
                key={idx}
                className="col-span-1 md:col-span-2 bg-rose-50 border border-rose-300 p-4 rounded-2xl shadow-sm text-rose-950"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-rose-700 mb-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  {card.data.title}
                </div>
                <p className="text-xs text-rose-800 mb-3">{card.data.location}</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${card.data.ambulancePhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Ambulance ({card.data.ambulancePhone})
                  </a>
                  <a
                    href={`tel:${card.data.doctorPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Resident Doctor
                  </a>
                </div>
              </div>
            );

          case 'action_button':
            return (
              <div key={idx} className="col-span-1 md:col-span-2">
                <button
                  onClick={() => navigate(card.data.route)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-900 hover:from-indigo-100 hover:to-purple-100 transition-all font-medium text-xs shadow-sm"
                >
                  <span className="font-semibold">{card.data.title}</span>
                  <span className="flex items-center gap-1 font-bold text-indigo-600">
                    {card.data.actionText} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
