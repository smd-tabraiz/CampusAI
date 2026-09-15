import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Search,
  Clock,
  Sparkles,
  MapPin,
  Flame,
  Leaf,
  HeartPulse,
  ChevronRight,
  Filter
} from 'lucide-react';
import { campusApi } from '../services/api';
import { Cafeteria, FoodItem } from '../types';

export const FoodPage: React.FC = () => {
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchFoodData = async () => {
    setLoading(true);
    try {
      const [cafeRes, foodRes] = await Promise.all([
        campusApi.getCafeterias(),
        campusApi.getFoodRecommendations({
          diet: selectedDiet !== 'all' ? selectedDiet : undefined,
          maxBudget,
          search: searchQuery || undefined
        })
      ]);

      setCafeterias(cafeRes.data.cafeterias || []);
      setRecommendations(foodRes.data.recommendations || []);
    } catch (err) {
      console.error('Failed to load food data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodData();
  }, [selectedDiet, maxBudget]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFoodData();
  };

  const budgetOptions = [
    { label: 'All Budgets', value: undefined },
    { label: 'Under ₹50', value: 50 },
    { label: 'Under ₹80', value: 80 },
    { label: 'Under ₹120', value: 120 }
  ];

  const dietOptions = [
    { label: 'All Diets', value: 'all' },
    { label: 'Pure Veg', value: 'veg' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Healthy & High Protein', value: 'healthy' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-emerald-600" />
          Smart Cafeteria & Dining AI
        </h1>
        <p className="text-xs text-slate-500">
          Hyperlocal menu recommendations tailored to student budget, dietary preferences, and peak times
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name (e.g. Masala Dosa, Biryani, Coffee, Salad)..."
            className="w-full pl-10 pr-24 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Dietary Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {dietOptions.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDiet(d.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedDiet === d.value
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Budget Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Budget:</span>
            {budgetOptions.map((b) => (
              <button
                key={b.label}
                onClick={() => setMaxBudget(b.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  maxBudget === b.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cafeteria Directory Cards */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Campus Cafeterias & Food Courts ({cafeterias.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cafeterias.map((cafe) => (
            <div
              key={cafe.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-32 w-full bg-slate-100">
                  <img
                    src={cafe.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                      {cafe.priceRange}
                    </span>
                    {cafe.isVegetarianOnly && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        Pure Veg
                      </span>
                    )}
                  </div>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/95 text-slate-900 text-[11px] font-bold shadow">
                    ★ {cafe.rating}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{cafe.name}</h3>
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {cafe.locationName}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 font-medium mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {cafe.openingHours}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{cafe.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Popular Highlights
                </div>
                <div className="flex flex-wrap gap-1">
                  {cafe.foodItems?.map((fi) => (
                    <span
                      key={fi.id}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-700"
                    >
                      {fi.name} (₹{fi.price})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Personalized Recommendations Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AI Recommendations ({recommendations.length} items)
          </div>
          {maxBudget && (
            <span className="text-xs text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              Filtered under ₹{maxBudget}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-slate-900">₹{item.price}</span>
                  <div className="flex items-center gap-1">
                    {item.isHealthy && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-blue-600" /> Healthy
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        item.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{item.name}</h3>
                <div className="text-xs text-slate-500 mb-2">📍 {item.cafeteria?.name}</div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{item.description}</p>

                {/* Why This Recommendation AI Banner */}
                {item.whyRecommended && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed mb-3">
                    💡 <span className="font-semibold">{item.whyRecommended}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                <span>Rating: ★ {item.popularScore}</span>
                <span className="font-semibold text-emerald-600">Available Today</span>
              </div>
            </div>
          ))}

          {recommendations.length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400">
              <Utensils className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="text-sm font-semibold">No food items found matching your filters</div>
              <p className="text-xs text-slate-400 mt-1">Try relaxing your budget or dietary criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
