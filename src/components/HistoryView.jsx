import { useState, useEffect } from 'react';
import { Pill, ArrowLeft, X, ChevronLeft, ChevronRight, Check, Star, Sun, Moon, Clock, Dumbbell, Heart, Gauge, BookOpen, StickyNote, Eye, Brain, Pencil, CloudSun, ChevronsLeftRight } from 'lucide-react';
import { supabase, isSupabaseConfigured, USER_ID } from '../lib/supabase';
import { defaultMedications } from '../hooks/useMedications';

const missingDefaults = {
  'sleep-quality': 'No data',        
  'sleep-hours': 'No data',         
  'exercise': 'None',
  'stretch': 'No',
  'weather': 'No data',
  'sunshine': 'No',
  'mood': 'No data',                 
  'paranoia': 'No data',             
  'scrambled-brains': 'No data',    
  'journaling': 'No',
  'notes': 'No notes'
};

const activityOrder = [
  'sleep-quality',
  'sleep-hours',
  'exercise',
  'stretch',
  'weather',
  'sunshine',
  'mood',
  'paranoia',
  'scrambled-brains',
  'journaling',
  'notes'
];

const activityNames = {
  'sleep-quality': 'Sleep Quality',
  'sleep-hours': 'Hours Slept',
  'exercise': 'Exercise',
  'stretch': 'Stretching',
  'weather': 'Weather',
  'sunshine': 'Sunshine',
  'mood': 'Mood',
  'paranoia': 'Paranoia',
  'scrambled-brains': 'Scrambled Brains',
  'journaling': 'Journaling',
  'notes': 'Notes'
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

function getActivityIcon(activityId) {
  switch (activityId) {
    case 'sleep-quality': return <Star className="w-4 h-4" />;
    case 'sleep-hours': return <Clock className="w-4 h-4" />;
    case 'exercise': return <Dumbbell className="w-4 h-4" />;
    case 'stretch': return <ChevronsLeftRight className="w-4 h-4" />;
    case 'weather': return <CloudSun className="w-4 h-4" />;
    case 'sunshine': return <Sun className="w-4 h-4" />;
    case 'mood': return <Heart className="w-4 h-4" />;
    case 'paranoia': return <Eye className="w-4 h-4" />;
    case 'scrambled-brains': return <Brain className="w-4 h-4" />;
    case 'journaling': return <BookOpen className="w-4 h-4" />;
    case 'notes': return <StickyNote className="w-4 h-4" />;
    default: return null;
  }
}

function getDisplayValue(entry, isMissing = false) {
  if (isMissing) {
    return missingDefaults[entry.activity_id];
  }

  const value = entry.value_boolean ?? entry.value_number ?? entry.value_text ?? entry.value_json;
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  } else if (typeof value === 'number') {
    if (entry.activity_id === 'sleep-hours') {
      return `${value} hours`;
    } else if (entry.activity_id === 'sleep-quality') {
      const labels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Great'];
      return `${value}/5 - ${labels[value] || ''}`;
    } else if (entry.activity_id === 'mood') {
      let moodLabel = 'Baseline';
      if (value <= -3) moodLabel = 'Depressed';
      else if (value <= -1) moodLabel = 'Low';
      else if (value >= 3) moodLabel = 'Manic';
      else if (value >= 1) moodLabel = 'Elevated';
      return `${value} - ${moodLabel}`;
    } else if (entry.activity_id === 'paranoia' || entry.activity_id === 'scrambled-brains') {
      let severityLabel = 'None';
      if (value >= 8) severityLabel = 'Severe';
      else if (value >= 5) severityLabel = 'Moderate';
      else if (value >= 1) severityLabel = 'Mild';
      return `${value}/10 - ${severityLabel}`;
    } else {
      return value.toString();
    }
  } else if (typeof value === 'string') {
    return value;
  }
  
  return '';
}

// Calendar View Component
function CalendarView({ onSelectDate, onBack, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [datesWithData, setDatesWithData] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayKey = getDateKey(today);

  // Get first day of month and calculate calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Load dates with data for current month
  useEffect(() => {
    async function loadMonthData() {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      try {
        // Get dates with medication logs
        const { data: medDates } = await supabase
          .from('medication_logs')
          .select('log_date')
          .eq('user_id', USER_ID)
          .gte('log_date', startDate)
          .lte('log_date', endDate);

        // Get dates with daily entries
        const { data: entryDates } = await supabase
          .from('daily_entries')
          .select('log_date')
          .eq('user_id', USER_ID)
          .gte('log_date', startDate)
          .lte('log_date', endDate);

        const dates = new Set();
        medDates?.forEach(d => dates.add(d.log_date));
        entryDates?.forEach(d => dates.add(d.log_date));
        
        setDatesWithData(dates);
      } catch (error) {
        console.error('Error loading month data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMonthData();
  }, [year, month, daysInMonth]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    // Don't go past current month
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  const isNextMonthDisabled = () => {
    const nextMonth = new Date(year, month + 1, 1);
    return nextMonth > new Date();
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, month, day);
    // Don't allow future dates
    if (clickedDate > today) return;
    onSelectDate(clickedDate);
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build calendar grid
  const calendarDays = [];
  // Empty cells before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

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

        {/* Month navigation */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
          
          <h2 className="font-semibold text-sand-900 dark:text-sand-100">
            {monthName}
          </h2>
          
          <button
            onClick={goToNextMonth}
            disabled={isNextMonthDisabled()}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-5">
        <div className="bg-white dark:bg-night-800 rounded-2xl border border-sand-200 dark:border-night-700 p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-sand-500 dark:text-sand-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateKey === todayKey;
              const hasData = datesWithData.has(dateKey);
              const isFuture = new Date(year, month, day) > today;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={isFuture}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-colors
                    ${isFuture 
                      ? 'text-sand-300 dark:text-night-600 cursor-not-allowed' 
                      : 'hover:bg-sand-100 dark:hover:bg-night-700 text-sand-900 dark:text-sand-100'
                    }
                    ${isToday ? 'ring-2 ring-calm-500' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-calm-600 dark:text-calm-400' : ''}`}>
                    {day}
                  </span>
                  {hasData && !isFuture && (
                    <div className="w-1.5 h-1.5 rounded-full bg-calm-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="text-center py-4 text-sand-500">Loading...</div>
        )}
      </div>
    </div>
  );
}

// Detail View Component
function DetailView({ initialDate, onBack, onEditDay }) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [medLogs, setMedLogs] = useState([]);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState(defaultMedications);

  const today = new Date();
  const dateKey = getDateKey(currentDate);

  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't go past today
    if (newDate <= today) {
      setCurrentDate(newDate);
    }
  };

  const isToday = () => {
    return getDateKey(today) === dateKey;
  };

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
          const { data: meds } = await supabase
            .from('medication_logs')
            .select('*')
            .eq('user_id', USER_ID)
            .eq('log_date', dateKey);
          
          setMedLogs(meds || []);

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
    const regularLogs = medLogs.filter(m => !m.custom_med_name);
    const extraLogs = medLogs.filter(m => m.custom_med_name);

    const daytimeLogs = [];
    const eveningLogs = [];

    medications.daytime.forEach(configMed => {
      const logs = regularLogs.filter(l => l.medication_id === configMed.id);
      logs.sort((a, b) => a.dose_number - b.dose_number);
      daytimeLogs.push(...logs);
    });

    medications.evening.forEach(configMed => {
      const logs = regularLogs.filter(l => l.medication_id === configMed.id);
      eveningLogs.push(...logs);
    });

    return { daytimeLogs, eveningLogs, extraLogs };
  };

  // Build complete entries list with missing activities
  const getCompleteEntries = () => {
    const completeList = [];

    activityOrder.forEach(activityId => {
      const existing = dailyEntries.find(e => e.activity_id === activityId);
      if (existing) {
        completeList.push({ ...existing, isMissing: false });
      } else {
        completeList.push({ 
          id: `missing-${activityId}`,
          activity_id: activityId, 
          isMissing: true 
        });
      }
    });

    return completeList;
  };

  const { daytimeLogs, eveningLogs, extraLogs } = organizedMeds();
  const completeEntries = getCompleteEntries();

  return (
    <div className="fixed inset-0 z-50 bg-sand-100 dark:bg-night-900 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-sand-100/80 dark:bg-night-900/80 backdrop-blur-lg border-b border-sand-200 dark:border-night-700">
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
          
          <h1 className="font-display font-semibold text-lg text-sand-900 dark:text-sand-100 text-center flex-1">
            {formatDate(dateKey)}
          </h1>
          
          <button
            onClick={goToNextDay}
            disabled={isToday()}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next day"
          >
            <ChevronRight className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
          
          <button
            onClick={onBack}
            className="p-2 ml-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Back to calendar"
          >
            <X className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
        </div>

        {/* Edit Day Button */}
        <div className="px-5 pb-4">
          <button
            onClick={() => onEditDay(currentDate)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium
              bg-amber-100 dark:bg-amber-900/30 
              text-amber-700 dark:text-amber-300
              hover:bg-amber-200 dark:hover:bg-amber-900/50
              transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit This Day</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-sand-500">Loading...</div>
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

            {/* Daily Entries - Always show */}
            <section>
              <h3 className="font-semibold text-sand-900 dark:text-sand-100 mb-3">Tracking</h3>
              <div className="bg-white dark:bg-night-800 rounded-xl border border-sand-200 dark:border-night-700 divide-y divide-sand-100 dark:divide-night-700">
                {completeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      entry.isMissing 
                        ? 'bg-sand-100 dark:bg-night-700 text-sand-400 dark:text-sand-500' 
                        : 'bg-calm-100 dark:bg-calm-900/30 text-calm-600 dark:text-calm-400'
                    }`}>
                      {getActivityIcon(entry.activity_id)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        entry.isMissing 
                          ? 'text-sand-400 dark:text-sand-500' 
                          : 'text-sand-900 dark:text-sand-100'
                      }`}>
                        {activityNames[entry.activity_id] || entry.activity_id}
                      </p>
                      <p className={`text-sm ${
                        entry.isMissing 
                          ? 'text-sand-400 dark:text-sand-500 italic' 
                          : 'text-sand-500 dark:text-sand-400'
                      }`}>
                        {getDisplayValue(entry, entry.isMissing)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// Main HistoryView Component
export default function HistoryView({ onBack, onClose, onEditDay }) {
  const [view, setView] = useState('calendar'); // 'calendar' or 'detail'
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setView('detail');
  };

  const handleBackToCalendar = () => {
    setView('calendar');
  };

  if (view === 'detail' && selectedDate) {
    return (
      <DetailView
        initialDate={selectedDate}
        onBack={handleBackToCalendar}
        onEditDay={onEditDay}
      />
    );
  }

  return (
    <CalendarView
      onSelectDate={handleSelectDate}
      onBack={onBack}
      onClose={onClose}
    />
  );
}
