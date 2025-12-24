import { useState } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * Modal for adding an extra/PRN medication
 */
export default function AddExtraMedModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    // Convert time to ISO string
    const [hours, minutes] = time.split(':');
    const takenAt = new Date();
    takenAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    onAdd({
      name: name.trim(),
      dosage: dosage.trim() || null,
      takenAt: takenAt.toISOString()
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-night-800 
        rounded-t-3xl sm:rounded-2xl 
        shadow-2xl
        animate-in slide-in-from-bottom duration-300
        max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sand-200 dark:border-night-700">
          <h2 className="font-display font-semibold text-lg text-sand-900 dark:text-sand-100">
            Add Extra Medication
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sand-100 dark:hover:bg-night-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-sand-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Medication name */}
          <div>
            <label 
              htmlFor="med-name" 
              className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1.5"
            >
              Medication name *
            </label>
            <input
              id="med-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ibuprofen"
              className="w-full px-4 py-3 rounded-xl
                bg-sand-50 dark:bg-night-700
                border-2 border-sand-200 dark:border-night-600
                text-sand-900 dark:text-sand-100
                placeholder:text-sand-400 dark:placeholder:text-sand-500
                focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-transparent
                transition-all"
              autoFocus
              required
            />
          </div>
          
          {/* Dosage */}
          <div>
            <label 
              htmlFor="med-dosage" 
              className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1.5"
            >
              Dosage (optional)
            </label>
            <input
              id="med-dosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 200mg"
              className="w-full px-4 py-3 rounded-xl
                bg-sand-50 dark:bg-night-700
                border-2 border-sand-200 dark:border-night-600
                text-sand-900 dark:text-sand-100
                placeholder:text-sand-400 dark:placeholder:text-sand-500
                focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-transparent
                transition-all"
            />
          </div>
          
          {/* Time taken */}
          <div>
            <label 
              htmlFor="med-time" 
              className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1.5"
            >
              Time taken
            </label>
            <input
              id="med-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl
                bg-sand-50 dark:bg-night-700
                border-2 border-sand-200 dark:border-night-600
                text-sand-900 dark:text-sand-100
                focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-transparent
                transition-all"
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl font-semibold
              bg-calm-500 hover:bg-calm-600 
              disabled:bg-sand-300 disabled:cursor-not-allowed
              text-white
              transition-colors
              flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </form>
        
        {/* Bottom safe area for iOS */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
