import React, { useState } from 'react';
import { TripModule, ItineraryStop, DayItinerary } from '../types';
import {
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Compass,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TripToolProps {
  data: TripModule;
}

export const TripTool: React.FC<TripToolProps> = ({ data }) => {
  const [tripState, setTripState] = useState<TripModule>(data);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [newStopDay, setNewStopDay] = useState<number | null>(null);

  // New Stop Form State
  const [newStopTitle, setNewStopTitle] = useState('');
  const [newStopLoc, setNewStopLoc] = useState('');
  const [newStopDesc, setNewStopDesc] = useState('');
  const [newStopCategory, setNewStopCategory] = useState<ItineraryStop['category']>('Sightseeing');

  const toggleDayExpanded = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleMoveStop = (dayNum: number, stopIdx: number, direction: 'up' | 'down') => {
    setTripState((prev) => {
      const updatedDays = prev.days.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        const newStops = [...d.stops];
        const targetIdx = direction === 'up' ? stopIdx - 1 : stopIdx + 1;
        if (targetIdx < 0 || targetIdx >= newStops.length) return d;

        const temp = newStops[stopIdx];
        newStops[stopIdx] = newStops[targetIdx];
        newStops[targetIdx] = temp;
        return { ...d, stops: newStops };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleRemoveStop = (dayNum: number, stopId: string) => {
    setTripState((prev) => {
      const updatedDays = prev.days.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        return { ...d, stops: d.stops.filter((s) => s.id !== stopId) };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddStopSubmit = (dayNum: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopTitle.trim()) return;

    const newStop: ItineraryStop = {
      id: `stop-custom-${Date.now()}`,
      timeOfDay: 'Afternoon',
      title: newStopTitle,
      description: newStopDesc || 'Custom added stop.',
      locationName: newStopLoc || 'Destination spot',
      category: newStopCategory,
      estimatedCost: '$15 - $30',
      durationMinutes: 60,
    };

    setTripState((prev) => {
      const updatedDays = prev.days.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        return { ...d, stops: [...d.stops, newStop] };
      });
      return { ...prev, days: updatedDays };
    });

    setNewStopDay(null);
    setNewStopTitle('');
    setNewStopLoc('');
    setNewStopDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Trip Header Banner */}
      <div className="bg-[#0A0A0A] text-white rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF3B30]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FF3B30] text-xs font-mono font-bold uppercase tracking-[0.2em]">
              <Compass className="h-4 w-4" />
              03. INTERACTIVE TRIP ITINERARY ENGINE
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white">
              {tripState.title} - {tripState.destination}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl font-light">{tripState.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-white/80 uppercase">
              <Calendar className="h-3.5 w-3.5 text-[#FF3B30]" />
              {tripState.totalDays} Days
            </div>

            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-white/80 uppercase">
              <DollarSign className="h-3.5 w-3.5 text-[#FF3B30]" />
              Budget: {tripState.estimatedBudgetTotal}
            </div>
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-6">
        {tripState.days.map((day) => {
          const isExpanded = expandedDays[day.dayNumber] ?? true;

          return (
            <div
              key={day.dayNumber}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              {/* Day Collapsible Bar */}
              <div
                onClick={() => toggleDayExpanded(day.dayNumber)}
                className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    D{day.dayNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Day {day.dayNumber}: {day.theme}
                    </h3>
                    <span className="text-xs text-slate-500">{day.stops.length} stops planned</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewStopDay(day.dayNumber);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 hover:bg-sky-200 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Stop
                  </button>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {/* Day Stops Content */}
              {isExpanded && (
                <div className="p-4 sm:p-6 space-y-4">
                  {day.stops.map((stop, stopIdx) => (
                    <div
                      key={stop.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start justify-between gap-4 transition-all hover:border-sky-400"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {stop.timeOfDay}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {stop.category}
                          </span>
                          <span className="text-slate-400">• Est. {stop.estimatedCost}</span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                          {stop.title}
                        </h4>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          {stop.locationName}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                          {stop.description}
                        </p>
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleMoveStop(day.dayNumber, stopIdx, 'up')}
                          disabled={stopIdx === 0}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30"
                          title="Move Stop Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStop(day.dayNumber, stopIdx, 'down')}
                          disabled={stopIdx === day.stops.length - 1}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30"
                          title="Move Stop Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(day.dayNumber, stop.id)}
                          className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
                          title="Remove Stop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Stop Form Modal Inline */}
                  {newStopDay === day.dayNumber && (
                    <form
                      onSubmit={(e) => handleAddStopSubmit(day.dayNumber, e)}
                      className="p-4 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-3"
                    >
                      <h4 className="font-bold text-xs text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                        Add Custom Stop to Day {day.dayNumber}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Stop Title (e.g. Tsukiji Market Walk)"
                          value={newStopTitle}
                          onChange={(e) => setNewStopTitle(e.target.value)}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Location Name"
                          value={newStopLoc}
                          onChange={(e) => setNewStopLoc(e.target.value)}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                        />
                      </div>
                      <textarea
                        placeholder="Description of activity..."
                        value={newStopDesc}
                        onChange={(e) => setNewStopDesc(e.target.value)}
                        rows={2}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setNewStopDay(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700"
                        >
                          Save Stop
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
