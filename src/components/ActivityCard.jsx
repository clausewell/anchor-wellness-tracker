import { useState } from 'react';
import { 
  Check, 
  Pill, 
  Moon, 
  Clock, 
  Dumbbell, 
  Heart, 
  BookOpen,
  Star,
  ChevronDown,
  ChevronUp,
  Gauge,
  StickyNote,
  Eye,
  Brain,
  CloudSun,
  ChevronsLeftRight,
  Sun
} from 'lucide-react';

// Icon mapping
const iconMap = {
  Pill,
  Moon,
  Clock,
  Dumbbell,
  Heart,
  BookOpen,
  Gauge,
  StickyNote,
  Eye,
  Brain,
  CloudSun,
  ChevronsLeftRight,
  Sun
};

// Color classes mapping
const colorClasses = {
  calm: {
    bg: 'bg-calm-100 dark:bg-calm-900/30',
    border: 'border-calm-300 dark:border-calm-700',
    accent: 'text-calm-600 dark:text-calm-400',
    button: 'bg-calm-500 hover:bg-calm-600',
    checked: 'bg-calm-500'
  },
  sand: {
    bg: 'bg-sand-200 dark:bg-sand-800/30',
    border: 'border-sand-300 dark:border-sand-600',
    accent: 'text-sand-700 dark:text-sand-300',
    button: 'bg-sand-500 hover:bg-sand-600',
    checked: 'bg-sand-500'
  },
  grove: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    accent: 'text-grove-600 dark:text-green-400',
    button: 'bg-grove-500 hover:bg-grove-600',
    checked: 'bg-grove-500'
  },
  ember: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    accent: 'text-ember-600 dark:text-orange-400',
    button: 'bg-ember-500 hover:bg-ember-600',
    checked: 'bg-ember-500'
  },
  blush: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    border: 'border-rose-300 dark:border-rose-700',
    accent: 'text-blush-600 dark:text-rose-400',
    button: 'bg-blush-500 hover:bg-blush-600',
    checked: 'bg-blush-500'
  }
};

// Checkbox input component
function CheckboxInput({ value, onChange, colors }) {
  const isChecked = value === true;
  
  return (
    <button
      onClick={() => onChange(!isChecked)}
      className={`
        w-14 h-14 rounded-2xl border-2 flex items-center justify-center
        transition-all duration-200 ease-out
        ${isChecked 
          ? `${colors.checked} border-transparent text-white scale-105` 
          : `bg-white dark:bg-night-800 ${colors.border} hover:scale-102`
        }
      `}
      aria-label={isChecked ? 'Mark as not done' : 'Mark as done'}
    >
      {isChecked && <Check className="w-7 h-7" strokeWidth={3} />}
    </button>
  );
}

// Star rating input component
function RatingInput({ value, onChange, config, colors }) {
  const maxRating = config?.maxRating || 5;
  const currentRating = value || 0;
  
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          onClick={() => onChange(rating === currentRating ? 0 : rating)}
          className={`
            p-1.5 rounded-lg transition-all duration-150
            ${rating <= currentRating 
              ? 'text-amber-400 scale-110' 
              : 'text-sand-300 dark:text-sand-600 hover:text-amber-300'
            }
          `}
          aria-label={`Rate ${rating} out of ${maxRating}`}
        >
          <Star 
            className="w-7 h-7" 
            fill={rating <= currentRating ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

// Number input component
function NumberInput({ value, onChange, config, colors }) {
  const { min = 0, max = 100, step = 1, unit = '', defaultValue = 0 } = config || {};
  const currentValue = value ?? defaultValue;
  
  const increment = () => {
    const newValue = Math.min(max, currentValue + step);
    onChange(newValue);
  };
  
  const decrement = () => {
    const newValue = Math.max(min, currentValue - step);
    onChange(newValue);
  };
  
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={decrement}
        disabled={currentValue <= min}
        className={`
          w-10 h-10 rounded-xl border-2 ${colors.border} 
          flex items-center justify-center
          bg-white dark:bg-night-800
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-sand-100 dark:hover:bg-night-700
          transition-colors
        `}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
      
      <div className="text-center min-w-[4rem]">
        <span className="text-2xl font-semibold font-display">
          {currentValue}
        </span>
        {unit && (
          <span className="text-sm text-sand-500 dark:text-sand-400 ml-1">
            {unit}
          </span>
        )}
      </div>
      
      <button
        onClick={increment}
        disabled={currentValue >= max}
        className={`
          w-10 h-10 rounded-xl border-2 ${colors.border}
          flex items-center justify-center
          bg-white dark:bg-night-800
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-sand-100 dark:hover:bg-night-700
          transition-colors
        `}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}

// Scale/slider input component
function ScaleInput({ value, onChange, config, colors }) {
  const { min = 1, max = 10, step = 1, labels = {}, defaultValue = 5 } = config || {};
  const currentValue = value ?? defaultValue;
  
  const getLabel = (val) => {
    if (labels[val]) return labels[val];
    if (labels[String(val)]) return labels[String(val)];
    return null;
  };
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-sand-500 dark:text-sand-400">
        <span>{labels[min] || labels[String(min)] || min}</span>
        <span>{labels[max] || labels[String(max)] || max}</span>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-sand-200 dark:bg-night-700 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-ember-500
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
        "
      />
      
      <div className="text-center">
        <span className="text-2xl font-semibold font-display">{currentValue}</span>
        {getLabel(currentValue) && (
          <span className="text-sm text-sand-500 dark:text-sand-400 ml-2">
            {getLabel(currentValue)}
          </span>
        )}
      </div>
    </div>
  );
}

// Text input component
function TextInput({ value, onChange, config, colors }) {
  const { placeholder = '', multiline = false, optional = false } = config || {};
  const currentValue = value || '';
  
  const baseClasses = `
    w-full px-4 py-3 rounded-xl
    bg-white dark:bg-night-800
    border-2 ${colors.border}
    focus:outline-none focus:ring-2 focus:ring-calm-500/50
    placeholder:text-sand-400 dark:placeholder:text-sand-600
    transition-all
  `;
  
  if (multiline) {
    return (
      <textarea
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`${baseClasses} resize-none`}
      />
    );
  }
  
  return (
    <input
      type="text"
      value={currentValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
}

// Main ActivityCard component
export default function ActivityCard({ activity, value, onChange }) {
  const Icon = iconMap[activity.icon] || Heart;
  const colors = colorClasses[activity.color] || colorClasses.calm;
  
  // Determine if the activity is "complete" for styling purposes
  const isComplete = () => {
    if (activity.type === 'checkbox') return value === true;
    if (activity.type === 'rating') return value > 0;
    if (activity.type === 'text') return value && value.trim().length > 0;
    if (activity.type === 'number' || activity.type === 'scale') return value !== undefined;
    return false;
  };
  
  // Render the appropriate input based on type
  const renderInput = () => {
    switch (activity.type) {
      case 'checkbox':
        return <CheckboxInput value={value} onChange={onChange} colors={colors} />;
      case 'rating':
        return <RatingInput value={value} onChange={onChange} config={activity.config} colors={colors} />;
      case 'number':
        return <NumberInput value={value} onChange={onChange} config={activity.config} colors={colors} />;
      case 'scale':
        return <ScaleInput value={value} onChange={onChange} config={activity.config} colors={colors} />;
      case 'text':
        return <TextInput value={value} onChange={onChange} config={activity.config} colors={colors} />;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`
        rounded-2xl p-5 
        ${colors.bg} 
        border ${colors.border}
        transition-all duration-200
        ${isComplete() ? 'ring-2 ring-grove-500/30' : ''}
      `}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-2.5 rounded-xl bg-white/60 dark:bg-night-800/60 ${colors.accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sand-900 dark:text-sand-100">
            {activity.name}
          </h3>
          <p className="text-sm text-sand-600 dark:text-sand-400 mt-0.5">
            {activity.description}
          </p>
        </div>
      </div>
      
      <div className={activity.type === 'checkbox' ? 'flex justify-end' : ''}>
        {renderInput()}
      </div>
    </div>
  );
}
