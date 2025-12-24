import { Check, X, Clock } from 'lucide-react';
import { formatTime } from '../hooks/useMedications';

/**
 * Display card for an extra/PRN medication that was added
 */
export default function ExtraMedCard({ medication, onRemove }) {
  const { name, dosage, takenAt } = medication;
  
  return (
    <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
      <div className="flex items-center gap-3">
        {/* Check icon */}
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5" strokeWidth={3} />
        </div>
        
        {/* Med info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sand-900 dark:text-sand-100 truncate">
              {name}
            </h3>
            {dosage && (
              <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                {dosage}
              </span>
            )}
          </div>
          
          {takenAt && (
            <div className="flex items-center gap-1 text-sm text-sand-500 dark:text-sand-400 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(takenAt)}</span>
              <span className="text-amber-600 dark:text-amber-400 ml-1">(extra)</span>
            </div>
          )}
        </div>
        
        {/* Remove button */}
        <button
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 
            text-sand-400 hover:text-sand-600 dark:hover:text-sand-300
            transition-colors"
          aria-label="Remove medication"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
