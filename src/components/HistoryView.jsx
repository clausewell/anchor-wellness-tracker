import { useState, useEffect } from 'react';
import { ArrowLeft, X, Pill, ChevronLeft, ChevronRight, Check, Star, Sun, Moon, Clock, Dumbbell, Heart, Gauge, BookOpen, StickyNote, Eye, Brain, CloudSun, StretchHorizontal } from 'lucide-react';
import { supabase, isSupabaseConfigured, USER_ID } from '../lib/supabase';
import { defaultMedications } from '../hooks/useMedications';

const iconMap = {
  Pill,
  Moon,
  Clock,
  Dumbbell,
  Heart,
  BookOpen,
  Gauge,
  StickyNote,
  Eye,
  Brain,
  Sun,
  CloudSun,
  ChevronsLeftRight
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
  const [medications, setMedications] = useState(defaultMedications);

  const dateKey = getDateKey(selectedDate);

  // Load saved medications config
  useEffect(() => {
    const saved = localStorage.getItem('anchor-medications-config');
    if (saved) {
      setMedications(JSON.parse(saved));
    }
  }, []);

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

  // Helper to get medication config by id
  const getMedConfig = (medId) => {
    const daytimeMed = medications.daytime.find(m => m.id === medId);
    if (daytimeMed) return { ...daytimeMed, type: 'daytime' };
    
    const eveningMed = medications.evening.find(m => m.id === medId);
    if (eveningMed) return { ...eveningMed, type: 'evening' };
    
    return null;
  };

  // Helper to format medication display
  const formatMedDisplay = (log) => {
    // Extra/PRN med
    if (log.custom_med_name) {
      return {
        name: log.custom_med_name,
        dosage: log.dosage_taken,
        isExtra: true
      };
    }

    const config = getMedConfig(log.medication_id);
    if (!config) {
      return {
        name: log.medication_id,
        dosage: log.dosage_value_taken ? `${log.dosage_value_taken}mg` : null,
        isExtra: false
      };
    }

    // Use the logged dosage if it exists (for adjustable meds), otherwise use config
    let dosage = config.dosage;
    if (log.dosage_value_taken && config.dosageAdjustable) {
      dosage = `${log.dosage_value_taken}${config.dosageUnit || 'mg'}`;
    }

    return {
      name: config.name,
      dosage: dosage,
      timesPerDay: config.timesPerDay,
      type: config.type,
      isExtra: false
    };
  };

  // Sort and organize medication logs
  const organizedMeds = () => {
    // Separate regular meds from extra meds
    const regularLogs = medLogs.filter(m => !m.custom_med_name);
    const extraLogs = medLogs.filter(m => m.custom_med_name);

    // Group regular meds by daytime/evening following config order
    const daytimeLogs = [];
    const eveningLogs = [];

    // Process daytime meds in config order
    medications.daytime.forEach(configMed => {
      const logs = regularLogs.filter(l => l.medication_id === configMed.id);
      logs.sort((a, b) => a.dose_number - b.dose_number);
      daytimeLogs.push(...logs);
    });

    // Process evening meds in config order
    medications.evening.forEach(configMed => {
      const logs = regularLogs.filter(l => l.medication_id === configMed.id);
      eveningLogs.push(...logs);
    });

    return { daytimeLogs, eveningLogs, extraLogs };
  };

  const { daytimeLogs, eveningLogs, extraLogs } = organizedMeds();

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
            {/* Daytime Medications */}
            {daytimeLogs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-sand-900 dark:text-sand-100">Daytime Meds</h3>
                </div>
                <div className="bg-white dark:bg-night-800 rounded-xl border border-sand-200 dark:border-night-700 divide-y divide-sand-100 dark:divide-night-700">
                  {daytimeLogs.map((log) => {
                    const display = formatMedDisplay(log);
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          log.taken ? 'bg-grove-500 text-white' : 'bg-sand-200 dark:bg-night-700 text-sand-400'
                        }`}>
                          {log.taken ? <Check className="w-4 h-4" /> : null}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sand-900 dark:text-sand-100">
                            {display.name}
                            {display.timesPerDay > 1 && ` (Dose ${log.dose_number})`}
                          </p>
                          <p className="text-sm text-sand-500 dark:text-sand-400">
                            {display.dosage && <span>{display.dosage}</span>}
                            {log.taken_at && <span>{display.dosage ? ' • ' : ''}{formatTime(log.taken_at)}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Extra Medications */}
            {extraLogs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-sand-900 dark:text-sand-100">Extra Meds</h3>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 divide-y divide-amber-100 dark:divide-amber-800/30">
                  {extraLogs.map((log) => {
                    const display = formatMedDisplay(log);
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sand-900 dark:text-sand-100">
                            {display.name}
                          </p>
                          <p className="text-sm text-sand-500 dark:text-sand-400">
                            {display.dosage && <span>{display.dosage}</span>}
                            {log.taken_at && <span>{display.dosage ? ' • ' : ''}{formatTime(log.taken_at)}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Evening Medications */}
            {eveningLogs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-sand-900 dark:text-sand-100">Evening Meds</h3>
                </div>
                <div className="bg-white dark:bg-night-800 rounded-xl border border-sand-200 dark:border-night-700 divide-y divide-sand-100 dark:divide-night-700">
                  {eveningLogs.map((log) => {
                    const display = formatMedDisplay(log);
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          log.taken ? 'bg-grove-500 text-white' : 'bg-sand-200 dark:bg-night-700 text-sand-400'
                        }`}>
                          {log.taken ? <Check className="w-4 h-4" /> : null}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sand-900 dark:text-sand-100">
                            {display.name}
                          </p>
                          <p className="text-sm text-sand-500 dark:text-sand-400">
                            {display.dosage && <span>{display.dosage}</span>}
                            {log.taken_at && <span>{display.dosage ? ' • ' : ''}{formatTime(log.taken_at)}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                      // Add context based on activity type
                      if (entry.activity_id === 'sleep-hours') {
                        displayValue = `${value} hours`;
                      } else if (entry.activity_id === 'sleep-quality') {
                        const labels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Great'];
                        displayValue = `${value}/5 - ${labels[value] || ''}`;
                      } else if (entry.activity_id === 'mood') {
                        // Mood is now -4 to 4
                        let moodLabel = 'Baseline';
                        if (value <= -3) moodLabel = 'Depressed';
                        else if (value <= -1) moodLabel = 'Low';
                        else if (value >= 3) moodLabel = 'Manic';
                        else if (value >= 1) moodLabel = 'Elevated';
                        displayValue = `${value} - ${moodLabel}`;
                      } else if (entry.activity_id === 'episode-intensity' || entry.activity_id === 'paranoia' || entry.activity_id === 'scrambled-brains') {
                        let severityLabel = 'None';
                        if (value >= 8) severityLabel = 'Severe';
                        else if (value >= 5) severityLabel = 'Moderate';
                        else if (value >= 1) severityLabel = 'Mild';
                        displayValue = `${value}/10 - ${severityLabel}`;
                      } else {
                        displayValue = value.toString();
                      }
                    } else if (typeof value === 'string') {
                      displayValue = value;
                    }

                    // Activity name mapping
                    const activityNames = {
                      'sleep-quality': 'Sleep Quality',
                      'sleep-hours': 'Hours Slept',
                      'exercise': 'Exercise',
                      'mood': 'Mood',
                      'paranoia': 'Paranoia',
                      'scrambled-brains': 'Scrambled Brains',
                      'journaling': 'Journaling',
                      'notes': 'Notes',
                      'weather': 'Weather',
                      'sunshine': 'Sunshine',
                      'stretch': 'Stretching'
                    };

                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3">
                        <div className="w-8 h-8 rounded-lg bg-calm-100 dark:bg-calm-900/30 text-calm-600 dark:text-calm-400 flex items-center justify-center">
                          {entry.activity_id === 'sleep-quality' && <Star className="w-4 h-4" />}
                          {entry.activity_id === 'sleep-hours' && <Clock className="w-4 h-4" />}
                          {entry.activity_id === 'exercise' && <Dumbbell className="w-4 h-4" />}
                          {entry.activity_id === 'mood' && <Heart className="w-4 h-4" />}
                          {entry.activity_id === 'episode-intensity' && <Gauge className="w-4 h-4" />}
                          {entry.activity_id === 'paranoia' && <Eye className="w-4 h-4" />}
                          {entry.activity_id === 'scrambled-brains' && <Brain className="w-4 h-4" />}
                          {entry.activity_id === 'journaling' && <BookOpen className="w-4 h-4" />}
                          {entry.activity_id === 'notes' && <StickyNote className="w-4 h-4" />}
                          {entry.activity_id === 'weather' && <CloudSun className="w-4 h-4" />}
                          {entry.activity_id === 'sunshine' && <Sun className="w-4 h-4" />}
                          {entry.activity_id === 'stretch' && <StretchHorizontal className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sand-900 dark:text-sand-100">
                            {activityNames[entry.activity_id] || entry.activity_id}
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
