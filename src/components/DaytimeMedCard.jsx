import { useState } from 'react';
import { Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTime } from '../hooks/useMedications';

/**
 * Individual dose checkbox with time
 */
function DoseCheckbox({ doseNumber, log, onToggle, onUpdateTime, showTime = true }) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isTaken = log?.taken || false;
  const takenAt = log?.takenAt;
  
  const handleTimeChange = (e) => {
    // Convert the time input to a full datetime
    const [hours, minutes] = e.target.value.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    onUpdateTime(date.toISOString());
    setShowTimePicker(false);
  };
  
  const getCurrentTimeValue = () => {
    if (!takenAt) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const d = new Date(takenAt);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-3">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`
          w-11 h-11 rounded-xl border-2 flex items-center justify-center
          transition-all duration-200 ease-out flex-shrink-0
          ${isTaken 
            ? 'bg-grove-500 border-grove-500 text-white scale-105' 
            : 'bg-white dark:bg-night-800 border-sand-300 dark:border-sand-600 hover:border-grove-400'
          }
        `}
        aria-label={`Dose ${doseNumber}: ${isTaken ? 'taken' : 'not taken'}`}
      >
        {isTaken && <Check className="w-5 h-5" strokeWidth={3} />}
      </button>
      
      {/* Time display/picker */}
      {showTime && isTaken && (
        <div className="relative">
          <button
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
              bg-sand-100 dark:bg-night-700 
              text-sand-600 dark:text-sand-300
              hover:bg-sand-200 dark:hover:bg-night-600
              transition-colors text-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{takenAt ? formatTime(takenAt) : 'Set time'}</span>
          </button>
          
          {showTimePicker && (
            <div className="absolute top-full left-0 mt-2 z-20">
              <input
                type="time"
                value={getCurrentTimeValue()}
                onChange={handleTimeChange}
                className="px-3 py-2 rounded-lg border-2 border-sand-300 dark:border-sand-600
                  bg-white dark:bg-night-800 text-sand-900 dark:text-sand-100
                  focus:outline-none focus:ring-2 focus:ring-calm-500"
                autoFocus
                onBlur={() => setShowTimePicker(false)}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Dose label */}
      {!isTaken && (
        <span className="text-sm text-sand-400 dark:text-sand-500">
          Dose {doseNumber}
        </span>
      )}
    </div>
  );
}

/**
 * Daytime medication card - shows medication with multiple dose checkboxes
 */
export default function DaytimeMedCard({ 
  medication, 
  getDoseLog, 
  onToggleDose, 
  onUpdateTime 
}) {
  const [expanded, setExpanded] = useState(true);
  
  const { id, name, dosage, timesPerDay } = medication;
  
  // Generate dose slots
  const doses = Array.from({ length: timesPerDay }, (_, i) => i + 1);
  
  // Count completed doses
  const completedDoses = doses.filter(doseNum => {
    const log = getDoseLog(id, doseNum);
    return log?.taken;
  }).length;
  
  const allComplete = completedDoses === timesPerDay;
  
  return (
    <div 
      className={`
        rounded-2xl p-4 transition-all duration-200
        ${allComplete 
          ? 'bg-grove-50 dark:bg-grove-900/20 border border-grove-200 dark:border-grove-800' 
          : 'bg-white dark:bg-night-800 border border-sand-200 dark:border-sand-700'
        }
      `}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm
            ${allComplete 
              ? 'bg-grove-500 text-white' 
              : 'bg-sand-100 dark:bg-night-700 text-sand-600 dark:text-sand-300'
            }
          `}>
            {completedDoses}/{timesPerDay}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sand-900 dark:text-sand-100">
              {name}
            </h3>
            {dosage && (
              <p className="text-sm text-sand-500 dark:text-sand-400">
                {dosage}
              </p>
            )}
          </div>
        </div>
        
        <div className="p-2 text-sand-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      {/* Dose checkboxes */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-sand-100 dark:border-night-700 space-y-3">
          {doses.map((doseNum) => (
            <DoseCheckbox
              key={doseNum}
              doseNumber={doseNum}
              log={getDoseLog(id, doseNum)}
              onToggle={() => onToggleDose(id, doseNum)}
              onUpdateTime={(time) => onUpdateTime(id, doseNum, time)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
