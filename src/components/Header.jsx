import { format } from 'date-fns';
import { Anchor, Settings } from 'lucide-react';

export default function Header({ date = new Date(), onSettingsClick }) {
  const dayOfWeek = format(date, 'EEEE');
  const formattedDate = format(date, 'MMMM d');
  
  return (
    <header className="sticky top-0 z-10 bg-sand-100/80 dark:bg-night-900/80 backdrop-blur-lg">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-calm-500 text-white">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-sand-900 dark:text-sand-100">
              {dayOfWeek}
            </h1>
            <p className="text-sm text-sand-600 dark:text-sand-400">
              {formattedDate}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-sand-600 dark:text-sand-400" />
        </button>
      </div>
    </header>
  );
}
