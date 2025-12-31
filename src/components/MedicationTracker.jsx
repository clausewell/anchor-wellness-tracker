import { useState, useEffect } from 'react';
import { Pill, Sun, Moon, Plus } from 'lucide-react';
import { defaultMedications, useMedicationLogs } from '../hooks/useMedications';
import DaytimeMedCard from './DaytimeMedCard';
import EveningMedCard from './EveningMedCard';
import AddExtraMedModal from './AddExtraMedModal';
import ExtraMedCard from './ExtraMedCard';

export default function MedicationTracker({ viewingDate = null }) {
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [medications, setMedications] = useState(defaultMedications);
  
  // Load saved medications config
  useEffect(() => {
    const saved = localStorage.getItem('anchor-medications-config');
    if (saved) {
      setMedications(JSON.parse(saved));
    }
  }, []);
  
  const {
    logs,
    eveningTime,
    extraMeds,
    toggleDose,
    updateDoseTime,
    updateDosage,
    setEveningTime,
    addExtraMed,
    removeExtraMed,
    getDoseLog,
    isDoseTaken
  } = useMedicationLogs(viewingDate);
  
  // Calculate daytime completion
  const daytimeMeds = medications.daytime;
  const totalDaytimeDoses = daytimeMeds.reduce((sum, med) => sum + (med.timesPerDay || 1), 0);
  const completedDaytimeDoses = daytimeMeds.reduce((sum, med) => {
    let count = 0;
    for (let i = 1; i <= (med.timesPerDay || 1); i++) {
      if (isDoseTaken(med.id, i)) count++;
    }
    return sum + count;
  }, 0);
  
  // Calculate evening completion
  const eveningMeds = medications.evening;
  const completedEveningDoses = eveningMeds.filter(med => 
    isDoseTaken(med.id, 1)
  ).length;
  
  const handleAddExtraMed = (med) => {
    addExtraMed(med);
    setShowAddExtra(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Daytime Medications Section */}
      <section>
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-sand-900 dark:text-sand-100">
              Daytime Meds
            </h2>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              {completedDaytimeDoses} of {totalDaytimeDoses} doses taken
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {daytimeMeds.map((med) => (
            <DaytimeMedCard
              key={med.id}
              medication={med}
              getDoseLog={getDoseLog}
              onToggleDose={toggleDose}
              onUpdateTime={updateDoseTime}
            />
          ))}
          
          {/* Extra meds taken today */}
          {extraMeds.map((extraMed) => (
            <ExtraMedCard
              key={extraMed.id}
              medication={extraMed}
              onRemove={() => removeExtraMed(extraMed.id)}
            />
          ))}
          
          {/* Add extra med button */}
          <button
            onClick={() => setShowAddExtra(true)}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-sand-300 dark:border-sand-700
              text-sand-500 dark:text-sand-400
              hover:border-calm-400 hover:text-calm-600 dark:hover:border-calm-600 dark:hover:text-calm-400
              transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add extra medication</span>
          </button>
        </div>
      </section>
      
      {/* Evening Medications Section */}
      <section>
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-sand-900 dark:text-sand-100">
              Evening Meds
            </h2>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              {completedEveningDoses} of {eveningMeds.length} taken
              {eveningTime && ` at ${new Date(eveningTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
            </p>
          </div>
        </div>
        
        <EveningMedCard
          medications={eveningMeds}
          eveningTime={eveningTime}
          getDoseLog={getDoseLog}
          onToggleDose={toggleDose}
          onUpdateDosage={updateDosage}
          onSetEveningTime={setEveningTime}
        />
      </section>
      
      {/* Add Extra Med Modal */}
      {showAddExtra && (
        <AddExtraMedModal
          onAdd={handleAddExtraMed}
          onClose={() => setShowAddExtra(false)}
        />
      )}
    </div>
  );
}
