import { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus, Trash2, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';

// Default medications (used as starting point)
const DEFAULT_MEDICATIONS = {
  daytime: [
    { id: 'propranolol', name: 'Propranolol', dosage: '20mg', timesPerDay: 2, dosageAdjustable: false },
    { id: 'xanax-xr', name: 'Xanax XR', dosage: '2mg', timesPerDay: 2, dosageAdjustable: false }
  ],
  evening: [
    { id: 'rexulti', name: 'Rexulti', dosage: '2mg', dosageValue: 2, dosageUnit: 'mg', dosageAdjustable: true },
    { id: 'lithium', name: 'Lithium', dosage: '1050mg', dosageValue: 1050, dosageUnit: 'mg', dosageAdjustable: true },
    { id: 'lamictal', name: 'Lamictal', dosage: '200mg', dosageAdjustable: false },
    { id: 'fish-oil', name: 'Fish Oil', dosage: null, dosageAdjustable: false },
    { id: 'multi-vitamin', name: 'Multi Vitamin', dosage: null, dosageAdjustable: false }
  ]
};

function MedCard({ med, onUpdate, onDelete, type }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(med.name);
  const [dosage, setDosage] = useState(med.dosage || '');
  const [timesPerDay, setTimesPerDay] = useState(med.timesPerDay || 1);
  const [dosageAdjustable, setDosageAdjustable] = useState(med.dosageAdjustable || false);

  const handleSave = () => {
    onUpdate({
      ...med,
      name,
      dosage: dosage || null,
      timesPerDay,
      dosageAdjustable
    });
    setExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-night-800 rounded-xl border border-sand-200 dark:border-night-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="text-left">
          <h4 className="font-medium text-sand-900 dark:text-sand-100">{med.name}</h4>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            {med.dosage || 'No dosage'} 
            {type === 'daytime' && ` • ${med.timesPerDay}x daily`}
            {med.dosageAdjustable && ' • Adjustable'}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-sand-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-sand-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-sand-100 dark:border-night-700 pt-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sand-300 dark:border-night-600 
                bg-sand-50 dark:bg-night-700 text-sand-900 dark:text-sand-100
                focus:outline-none focus:ring-2 focus:ring-calm-500"
            />
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1">
              Dosage
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 20mg"
              className="w-full px-3 py-2 rounded-lg border border-sand-300 dark:border-night-600 
                bg-sand-50 dark:bg-night-700 text-sand-900 dark:text-sand-100
                focus:outline-none focus:ring-2 focus:ring-calm-500"
            />
          </div>

          {/* Times per day (daytime only) */}
          {type === 'daytime' && (
            <div>
              <label className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1">
                Times per day
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
                  className="w-10 h-10 rounded-lg border border-sand-300 dark:border-night-600 
                    flex items-center justify-center hover:bg-sand-100 dark:hover:bg-night-700"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-sand-900 dark:text-sand-100 w-8 text-center">
                  {timesPerDay}
                </span>
                <button
                  onClick={() => setTimesPerDay(timesPerDay + 1)}
                  className="w-10 h-10 rounded-lg border border-sand-300 dark:border-night-600 
                    flex items-center justify-center hover:bg-sand-100 dark:hover:bg-night-700"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Dosage adjustable (evening only) */}
          {type === 'evening' && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-sand-700 dark:text-sand-300">
                Dosage can change daily
              </label>
              <button
                onClick={() => setDosageAdjustable(!dosageAdjustable)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  dosageAdjustable ? 'bg-calm-500' : 'bg-sand-300 dark:bg-night-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  dosageAdjustable ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onDelete(med.id)}
              className="flex-1 py-2 px-4 rounded-lg font-medium
                bg-blush-100 dark:bg-blush-900/30 
                text-blush-600 dark:text-blush-400
                hover:bg-blush-200 dark:hover:bg-blush-900/50
                flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 rounded-lg font-medium
                bg-calm-500 hover:bg-calm-600
                text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddMedForm({ type, onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [dosageAdjustable, setDosageAdjustable] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      dosage: dosage.trim() || null,
      timesPerDay,
      dosageAdjustable
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-calm-50 dark:bg-calm-900/20 rounded-xl p-4 space-y-4 border border-calm-200 dark:border-calm-800">
      <div>
        <label className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1">
          Medication name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Aspirin"
          className="w-full px-3 py-2 rounded-lg border border-sand-300 dark:border-night-600 
            bg-white dark:bg-night-800 text-sand-900 dark:text-sand-100
            focus:outline-none focus:ring-2 focus:ring-calm-500"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1">
          Dosage
        </label>
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="e.g., 100mg"
          className="w-full px-3 py-2 rounded-lg border border-sand-300 dark:border-night-600 
            bg-white dark:bg-night-800 text-sand-900 dark:text-sand-100
            focus:outline-none focus:ring-2 focus:ring-calm-500"
        />
      </div>

      {type === 'daytime' && (
        <div>
          <label className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1">
            Times per day
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
              className="w-10 h-10 rounded-lg border border-sand-300 dark:border-night-600 
                flex items-center justify-center hover:bg-sand-100 dark:hover:bg-night-700"
            >
              -
            </button>
            <span className="text-xl font-semibold text-sand-900 dark:text-sand-100 w-8 text-center">
              {timesPerDay}
            </span>
            <button
              type="button"
              onClick={() => setTimesPerDay(timesPerDay + 1)}
              className="w-10 h-10 rounded-lg border border-sand-300 dark:border-night-600 
                flex items-center justify-center hover:bg-sand-100 dark:hover:bg-night-700"
            >
              +
            </button>
          </div>
        </div>
      )}

      {type === 'evening' && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-sand-700 dark:text-sand-300">
            Dosage can change daily
          </label>
          <button
            type="button"
            onClick={() => setDosageAdjustable(!dosageAdjustable)}
            className={`w-12 h-7 rounded-full transition-colors ${
              dosageAdjustable ? 'bg-calm-500' : 'bg-sand-300 dark:bg-night-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
              dosageAdjustable ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-lg font-medium
            bg-sand-100 dark:bg-night-700 
            text-sand-700 dark:text-sand-300
            hover:bg-sand-200 dark:hover:bg-night-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-2 px-4 rounded-lg font-medium
            bg-calm-500 hover:bg-calm-600 disabled:bg-sand-300 disabled:cursor-not-allowed
            text-white"
        >
          Add
        </button>
      </div>
    </form>
  );
}

export default function MedicationSettings({ onBack, onClose }) {
  const [medications, setMedications] = useState(DEFAULT_MEDICATIONS);
  const [addingTo, setAddingTo] = useState(null); // 'daytime' or 'evening'

  // Load saved medications on mount
  useEffect(() => {
    const saved = localStorage.getItem('anchor-medications-config');
    if (saved) {
      setMedications(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever medications change
  const saveMedications = (newMeds) => {
    setMedications(newMeds);
    localStorage.setItem('anchor-medications-config', JSON.stringify(newMeds));
  };

  const handleUpdate = (type, updatedMed) => {
    const newMeds = {
      ...medications,
      [type]: medications[type].map(m => m.id === updatedMed.id ? updatedMed : m)
    };
    saveMedications(newMeds);
  };

  const handleDelete = (type, medId) => {
    const newMeds = {
      ...medications,
      [type]: medications[type].filter(m => m.id !== medId)
    };
    saveMedications(newMeds);
  };

  const handleAdd = (type, newMed) => {
    const newMeds = {
      ...medications,
      [type]: [...medications[type], newMed]
    };
    saveMedications(newMeds);
    setAddingTo(null);
  };

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
            Edit Medications
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sand-200 dark:hover:bg-night-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-sand-600 dark:text-sand-400" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6 pb-20">
        {/* Daytime Medications */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-sand-900 dark:text-sand-100">Daytime Meds</h2>
          </div>
          
          <div className="space-y-2">
            {medications.daytime.map(med => (
              <MedCard
                key={med.id}
                med={med}
                type="daytime"
                onUpdate={(updated) => handleUpdate('daytime', updated)}
                onDelete={(id) => handleDelete('daytime', id)}
              />
            ))}

            {addingTo === 'daytime' ? (
              <AddMedForm
                type="daytime"
                onAdd={(med) => handleAdd('daytime', med)}
                onCancel={() => setAddingTo(null)}
              />
            ) : (
              <button
                onClick={() => setAddingTo('daytime')}
                className="w-full py-3 rounded-xl border-2 border-dashed border-sand-300 dark:border-night-600
                  text-sand-500 dark:text-sand-400 font-medium
                  hover:border-calm-400 hover:text-calm-600 dark:hover:border-calm-600 dark:hover:text-calm-400
                  flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add daytime medication
              </button>
            )}
          </div>
        </section>

        {/* Evening Medications */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-sand-900 dark:text-sand-100">Evening Meds</h2>
          </div>
          
          <div className="space-y-2">
            {medications.evening.map(med => (
              <MedCard
                key={med.id}
                med={med}
                type="evening"
                onUpdate={(updated) => handleUpdate('evening', updated)}
                onDelete={(id) => handleDelete('evening', id)}
              />
            ))}

            {addingTo === 'evening' ? (
              <AddMedForm
                type="evening"
                onAdd={(med) => handleAdd('evening', med)}
                onCancel={() => setAddingTo(null)}
              />
            ) : (
              <button
                onClick={() => setAddingTo('evening')}
                className="w-full py-3 rounded-xl border-2 border-dashed border-sand-300 dark:border-night-600
                  text-sand-500 dark:text-sand-400 font-medium
                  hover:border-calm-400 hover:text-calm-600 dark:hover:border-calm-600 dark:hover:text-calm-400
                  flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add evening medication
              </button>
            )}
          </div>
        </section>

        <p className="text-sm text-sand-500 dark:text-sand-400 text-center">
          Changes take effect immediately
        </p>
      </div>
    </div>
  );
}
