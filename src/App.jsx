import { useState } from 'react';
import { useDailyEntries, getTodayKey, getDateKey } from './hooks/useStorage';
import { defaultActivities } from './data/activities';
import Header from './components/Header';
import DailyProgress from './components/DailyProgress';
import ActivityCard from './components/ActivityCard';
import MedicationTracker from './components/MedicationTracker';
import Settings from './components/Settings';
import { Pill, Activity } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('meds'); // 'meds' or 'activities'
  const [showSettings, setShowSettings] = useState(false);
  const [viewingDate, setViewingDate] = useState(null); // null = today, Date = editing past
  
  const { getEntriesForDate, setEntryForDate, loading } = useDailyEntries(viewingDate);
  
  const dateKey = viewingDate ? getDateKey(viewingDate) : getTodayKey();
  const entries = getEntriesForDate(dateKey);
  
  const isEditingPast = viewingDate !== null;
  
  const handleActivityChange = (activityId, value) => {
    setEntryForDate(dateKey, activityId, value);
  };
  
  const handleEditDay = (date) => {
    setViewingDate(date);
    setShowSettings(false);
  };
  
  const handleBackToToday = () => {
    setViewingDate(null);
  };
  
  // Filter out medication activities since we have a dedicated tracker now
  const nonMedActivities = defaultActivities.filter(
    a => !a.id.includes('meds') && !a.id.includes('medication')
  );
  
  if (showSettings) {
    return <Settings onClose={() => setShowSettings(false)} onEditDay={handleEditDay} />;
  }
  
  return (
    <div className="min-h-screen bg-sand-100 dark:bg-night-900 flex flex-col">
      <Header 
        date={viewingDate || new Date()}
        onSettingsClick={() => setShowSettings(true)}
        isEditingPast={isEditingPast}
        onBackToToday={handleBackToToday}
      />
      
      {/* Tab navigation */}
      <div className="px-5 mb-4">
        <div className="flex bg-sand-200 dark:bg-night-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('meds')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all
              ${activeTab === 'meds' 
                ? 'bg-white dark:bg-night-700 text-sand-900 dark:text-sand-100 shadow-sm' 
                : 'text-sand-500 dark:text-sand-400 hover:text-sand-700 dark:hover:text-sand-300'
              }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medications</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all
              ${activeTab === 'activities' 
                ? 'bg-white dark:bg-night-700 text-sand-900 dark:text-sand-100 shadow-sm' 
                : 'text-sand-500 dark:text-sand-400 hover:text-sand-700 dark:hover:text-sand-300'
              }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tracking</span>
          </button>
        </div>
      </div>
      
      <main className="flex-1 pb-8 px-5">
        {activeTab === 'meds' ? (
          <MedicationTracker viewingDate={viewingDate} />
        ) : (
          <>
            <DailyProgress 
              activities={nonMedActivities} 
              entries={entries} 
            />
            
            <div className="space-y-4 mt-4">
              {nonMedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  value={entries[activity.id]?.value}
                  onChange={(value) => handleActivityChange(activity.id, value)}
                />
              ))}
            </div>
          </>
        )}
      </main>
      
      {/* Bottom safe area padding for home indicator */}
      <div className="h-safe-bottom" />
    </div>
  );
}

export default App;
