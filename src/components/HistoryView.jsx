import { useState, useEffect } from 'react';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Check, Star, Moon, Clock, Dumbbell, Heart, Gauge, BookOpen, StickyNote } from 'lucide-react';
import { supabase, isSupabaseConfigured, USER_ID } from '../lib/supabase';

const iconMap = {
  Moon,
  Clock,
  Dumbbell,
  Heart,
  Gauge,
  BookOpen,
  StickyNote
};

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric'
  });
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HistoryView({ onBack, onClose }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [medLogs, setMedLogs] = useState([]);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateKey = getDateKey(selectedDate);

  // Load data for selected date
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      if (isSupabaseConfigured()) {
        try {
          // Load medication logs
          const { data: meds } = await supabase
            .from('medication_logs')
            .select('*')
            .eq('user_id', USER_ID)
            .eq('log_date', dateKey);
          
          setMedLogs(meds || []);

          // Load daily entries
          const { data: entries } = await supabase
            .from('daily_entries')
            .select('*')
            .eq('user_id', USER_ID)
            .eq('log_date', dateKey);
          
          setDailyEntries(entries || []);
        } catch (error) {
          console.error('Error loading history:', error);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [dateKey]);

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't go past today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const isToday = () => {
    const today = new Date();
    return getDateKey(today) === dateKey;
  };

  // Group medications by type
  const daytimeMeds = medLogs.filter(m => !m.custom_med_name && ['propranolol', 'xanax-xr'].includes(m.medication_id));
  const eveningMeds = medLogs.filter(m => !m.custom_med_name && !['propranolol', 'xanax-xr'].includes(m.medication_id));
  const extraMeds = medLogs.filter(m => m.custom_med_name);

  return (
    <div className="fixed inset-0 z-50 bg-sand-100 dark:bg-night-900 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-sand-100/80 dark:bg-night-900/80 backdrop-blur-lg border-b border-sand-200 dark:border-night-700">
        <div className="px-5 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
          <h1 className="font-display font-semibold text-xl text-sand-900 dark:text-sand-100 flex-1">
            History
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
        </div>

        {/* Date navigation */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
          
          <div className="text-center">
            <h2 className="font-semibold text-sand-900 dark:text-sand-100">
              {formatDate(dateKey)}
            </h2>
          </div>
          
          <button
            onClick={goToNextDay}
            disabled={isToday()}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-sand-500">Loading...</div>
        ) : (medLogs.length === 0 && dailyEntries.length === 0) ? (
          <div className="text-center py-12 text-sand-500">
            No entries for this day
          </div>
        ) : (
          <>
            {/* Medications */}
            {medLogs.length > 0 && (
              <section>
                <h3 className="font-semibold text-sand-900 dark:text-sand-100 mb-3">Medications</h3>
                <div className="bg-white dark:bg-night-800 rounded-xl border border-sand-200 dark:border-night-700 divide-y divide-sand-100 dark:divide-night-700">
                  {medLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.taken ? 'bg-grove-500 text-white' : 'bg-sand-200 dark:bg-night-700 text-sand-400'
                      }`}>
                        {log.taken ? <Check className="w-4 h-4" /> : null}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sand-900 dark:text-sand-100">
                          {log.custom_med_name || log.medication_id}
                          {log.dose_number > 1 && ` (Dose ${log.dose_number})`}
                        </p>
                        {log.taken_at && (
                          <p className="text-sm text-sand-500 dark:text-sand-400">
                            {formatTime(log.taken_at)}
                            {log.dosage_taken && ` • ${log.dosage_taken}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Daily Entries */}
            {dailyEntries.length > 0 && (
              <section>
                <h3 className="font-semibold text-sand-900 dark:text-sand-100 mb-3">Tracking</h3>
                <div className="bg-white dark:bg-night-800 rounded-xl border border-sand-200 dark:border-night-700 divide-y divide-sand-100 dark:divide-night-700">
                  {dailyEntries.map((entry) => {
                    // Determine the value
                    let value = entry.value_boolean ?? entry.value_number ?? entry.value_text ?? entry.value_json;
                    let displayValue = '';
                    
                    if (typeof value === 'boolean') {
                      displayValue = value ? 'Yes' : 'No';
                    } else if (typeof value === 'number') {
                      displayValue = value.toString();
                    } else if (typeof value === 'string') {
                      displayValue = value;
                    }

                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3">
                        <div className="w-8 h-8 rounded-lg bg-calm-100 dark:bg-calm-900/30 text-calm-600 dark:text-calm-400 flex items-center justify-center">
                          {entry.activity_id === 'sleep-quality' && <Star className="w-4 h-4" />}
                          {entry.activity_id === 'sleep-hours' && <Clock className="w-4 h-4" />}
                          {entry.activity_id === 'exercise' && <Dumbbell className="w-4 h-4" />}
                          {entry.activity_id === 'mood' && <Heart className="w-4 h-4" />}
                          {entry.activity_id === 'episode-intensity' && <Gauge className="w-4 h-4" />}
                          {entry.activity_id === 'journaling' && <BookOpen className="w-4 h-4" />}
                          {entry.activity_id === 'notes' && <StickyNote className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sand-900 dark:text-sand-100 capitalize">
                            {entry.activity_id.replace(/-/g, ' ')}
                          </p>
                          <p className="text-sm text-sand-500 dark:text-sand-400">
                            {displayValue}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
