import { useState } from 'react';
import { Check, Clock, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { formatTime } from '../hooks/useMedications';

/**
 * Single evening medication row
 */
function EveningMedRow({ 
  medication, 
  log, 
  onToggle, 
  onUpdateDosage,
  disabled = false 
}) {
  const { id, name, dosage, dosageValue, dosageUnit, dosageAdjustable } = medication;
  const isTaken = log?.taken || false;
  const currentDosageValue = log?.dosageValue ?? dosageValue;
  
  // Dosage adjustment step (smart defaults)
  const getStep = () => {
    if (!dosageUnit) return 1;
    if (dosageUnit === 'mg' && dosageValue >= 100) return 50; // Lithium: 50mg steps
    if (dosageUnit === 'mg' && dosageValue < 10) return 0.5;  // Rexulti: 0.5mg steps
    return 1;
  };
  
  const step = getStep();
  
  const adjustDosage = (delta) => {
    const newValue = Math.max(0, currentDosageValue + delta);
    onUpdateDosage(id, 1, newValue);
  };
  
  return (
    <div className={`
      flex items-center gap-3 py-3
      ${!disabled ? '' : 'opacity-50'}
    `}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(id, 1)}
        disabled={disabled}
        className={`
          w-10 h-10 rounded-xl border-2 flex items-center justify-center
          transition-all duration-200 ease-out flex-shrink-0
          ${isTaken 
            ? 'bg-grove-500 border-grove-500 text-white' 
            : 'bg-white dark:bg-night-800 border-sand-300 dark:border-sand-600 hover:border-grove-400'
          }
          disabled:cursor-not-allowed
        `}
        aria-label={`${name}: ${isTaken ? 'taken' : 'not taken'}`}
      >
        {isTaken && <Check className="w-5 h-5" strokeWidth={3} />}
      </button>
      
      {/* Med name */}
      <div className="flex-1 min-w-0">
        <span className={`font-medium ${isTaken ? 'text-sand-900 dark:text-sand-100' : 'text-sand-600 dark:text-sand-400'}`}>
          {name}
        </span>
      </div>
      
      {/* Dosage display or adjuster */}
      {dosageAdjustable ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustDosage(-step)}
            className="w-8 h-8 rounded-lg bg-sand-100 dark:bg-night-700 
              text-sand-600 dark:text-sand-300
              hover:bg-sand-200 dark:hover:bg-night-600
              flex items-center justify-center transition-colors"
            aria-label="Decrease dosage"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="min-w-[4rem] text-center font-medium text-sand-700 dark:text-sand-300">
            {currentDosageValue}{dosageUnit}
          </span>
          
          <button
            onClick={() => adjustDosage(step)}
            className="w-8 h-8 rounded-lg bg-sand-100 dark:bg-night-700 
              text-sand-600 dark:text-sand-300
              hover:bg-sand-200 dark:hover:bg-night-600
              flex items-center justify-center transition-colors"
            aria-label="Increase dosage"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : dosage ? (
        <span className="text-sm text-sand-500 dark:text-sand-400 font-medium">
          {dosage}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Evening medications card - single time entry for all evening meds
 */
export default function EveningMedCard({ 
  medications, 
  eveningTime,
  getDoseLog, 
  onToggleDose, 
  onUpdateDosage,
  onSetEveningTime 
}) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Count completed
  const completedCount = medications.filter(med => {
    const log = getDoseLog(med.id, 1);
    return log?.taken;
  }).length;
  
  const allComplete = completedCount === medications.length;
  
  const getCurrentTimeValue = () => {
    if (!eveningTime) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const d = new Date(eveningTime);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  
  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    onSetEveningTime(date.toISOString());
    setShowTimePicker(false);
  };
  
  const handleTakeAll = () => {
    // If not all taken, mark all as taken
    if (!allComplete) {
      medications.forEach(med => {
        const log = getDoseLog(med.id, 1);
        if (!log?.taken) {
          onToggleDose(med.id, 1);
        }
      });
      // Set the time if not already set
      if (!eveningTime) {
        onSetEveningTime(new Date().toISOString());
      }
    }
  };
  
  return (
    <div 
      className={`
        rounded-2xl overflow-hidden transition-all duration-200
        ${allComplete 
          ? 'bg-grove-50 dark:bg-grove-900/20 border border-grove-200 dark:border-grove-800' 
          : 'bg-white dark:bg-night-800 border border-sand-200 dark:border-sand-700'
        }
      `}
    >
      {/* Time header */}
      <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {eveningTime ? `Taken at ${formatTime(eveningTime)}` : 'Time taken'}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium
                bg-white dark:bg-night-800 
                text-indigo-600 dark:text-indigo-400
                hover:bg-indigo-100 dark:hover:bg-indigo-900/30
                transition-colors"
            >
              {eveningTime ? 'Change' : 'Set time'}
            </button>
            
            {showTimePicker && (
              <div className="absolute top-full right-0 mt-2 z-20">
                <input
                  type="time"
                  value={getCurrentTimeValue()}
                  onChange={handleTimeChange}
                  className="px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-600
                    bg-white dark:bg-night-800 text-sand-900 dark:text-sand-100
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  onBlur={() => setShowTimePicker(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Medications list */}
      <div className="px-4 divide-y divide-sand-100 dark:divide-night-700">
        {medications.map((med) => (
          <EveningMedRow
            key={med.id}
            medication={med}
            log={getDoseLog(med.id, 1)}
            onToggle={onToggleDose}
            onUpdateDosage={onUpdateDosage}
          />
        ))}
      </div>
      
      {/* Take all button */}
      {!allComplete && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={handleTakeAll}
            className="w-full py-3 rounded-xl font-medium
              bg-indigo-500 hover:bg-indigo-600 
              text-white
              transition-colors"
          >
            Take all evening meds
          </button>
        </div>
      )}
      
      {/* Completion message */}
      {allComplete && (
        <div className="px-4 pb-4 pt-2 text-center text-grove-600 dark:text-grove-400 text-sm font-medium">
          ✓ All evening meds taken
        </div>
      )}
    </div>
  );
}
