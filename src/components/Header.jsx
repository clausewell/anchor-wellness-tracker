import { format } from 'date-fns';
import { Anchor, Settings, ArrowLeft } from 'lucide-react';

export default function Header({ date = new Date(), onSettingsClick, isEditingPast = false, onBackToToday }) {
  const dayOfWeek = format(date, 'EEEE');
  const formattedDate = format(date, 'MMMM d');
  
  return (
    <header className="sticky top-0 z-10 bg-sand-100/80 dark:bg-night-900/80 backdrop-blur-lg">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEditingPast ? (
            <button
              onClick={onBackToToday}
              className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-calm-500 text-white">
              <Anchor className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-display font-semibold text-lg text-sand-900 dark:text-sand-100">
              {isEditingPast ? 'Editing' : dayOfWeek}
            </h1>
            <p className={`text-sm ${isEditingPast ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-sand-600 dark:text-sand-400'}`}>
              {formattedDate}
            </p>
          </div>
        </div>
        
        {!isEditingPast && (
          <button 
            onClick={onSettingsClick}
            className="p-2.5 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-sand-600 dark:text-sand-400" />
          </button>
        )}
      </div>
    </header>
  );
}
