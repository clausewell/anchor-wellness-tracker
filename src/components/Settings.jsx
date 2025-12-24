import { useState } from 'react';
import { X, Pill, Calendar, RotateCcw, ChevronRight } from 'lucide-react';
import MedicationSettings from './MedicationSettings';
import HistoryView from './HistoryView';

export default function Settings({ onClose }) {
  const [activeView, setActiveView] = useState('menu'); // 'menu', 'medications', 'history'
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetToday = async () => {
    // Clear localStorage for today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    // Clear from localStorage
    const medLogs = JSON.parse(localStorage.getItem('anchor-med-logs') || '{}');
    delete medLogs[dateKey];
    localStorage.setItem('anchor-med-logs', JSON.stringify(medLogs));

    const eveningTimes = JSON.parse(localStorage.getItem('anchor-evening-times') || '{}');
    delete eveningTimes[dateKey];
    localStorage.setItem('anchor-evening-times', JSON.stringify(eveningTimes));

    const extraMeds = JSON.parse(localStorage.getItem('anchor-extra-meds') || '{}');
    delete extraMeds[dateKey];
    localStorage.setItem('anchor-extra-meds', JSON.stringify(extraMeds));

    const entries = JSON.parse(localStorage.getItem('anchor-entries') || '{}');
    delete entries[dateKey];
    localStorage.setItem('anchor-entries', JSON.stringify(entries));

    setShowResetConfirm(false);
    
    // Reload the page to reflect changes
    window.location.reload();
  };

  if (activeView === 'medications') {
    return <MedicationSettings onBack={() => setActiveView('menu')} onClose={onClose} />;
  }

  if (activeView === 'history') {
    return <HistoryView onBack={() => setActiveView('menu')} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-sand-100 dark:bg-night-900">
      {/* Header */}
      <div className="sticky top-0 bg-sand-100/80 dark:bg-night-900/80 backdrop-blur-lg border-b border-sand-200 dark:border-night-700">
        <div className="px-5 py-4 flex items-center justify-between">
          <h1 className="font-display font-semibold text-xl text-sand-900 dark:text-sand-100">
            Settings
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="p-5 space-y-3">
        {/* Edit Medications */}
        <button
          onClick={() => setActiveView('medications')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-night-800 border border-sand-200 dark:border-night-700 hover:border-calm-400 dark:hover:border-calm-600 transition-colors"
        >
          <div className="p-3 rounded-xl bg-calm-100 dark:bg-calm-900/30 text-calm-600 dark:text-calm-400">
            <Pill className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-sand-900 dark:text-sand-100">
              Edit Medications
            </h3>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              Add, remove, or change your meds
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-sand-400" />
        </button>

        {/* View History */}
        <button
          onClick={() => setActiveView('history')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-night-800 border border-sand-200 dark:border-night-700 hover:border-calm-400 dark:hover:border-calm-600 transition-colors"
        >
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-sand-900 dark:text-sand-100">
              View History
            </h3>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              See past days and entries
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-sand-400" />
        </button>

        {/* Reset Today */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-night-800 border border-sand-200 dark:border-night-700 hover:border-blush-400 dark:hover:border-blush-600 transition-colors"
        >
          <div className="p-3 rounded-xl bg-blush-100 dark:bg-blush-900/30 text-blush-600 dark:text-blush-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-sand-900 dark:text-sand-100">
              Reset Today
            </h3>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              Clear all entries for today
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-sand-400" />
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-5">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-white dark:bg-night-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display font-semibold text-lg text-sand-900 dark:text-sand-100 mb-2">
              Reset Today's Entries?
            </h3>
            <p className="text-sand-600 dark:text-sand-400 mb-6">
              This will clear all medications and tracking entries for today. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium
                  bg-sand-100 dark:bg-night-700 
                  text-sand-700 dark:text-sand-300
                  hover:bg-sand-200 dark:hover:bg-night-600
                  transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToday}
                className="flex-1 py-3 px-4 rounded-xl font-medium
                  bg-blush-500 hover:bg-blush-600
                  text-white
                  transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
