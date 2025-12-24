/**
 * Activity definitions
 * Each activity has a type that determines how it's rendered and tracked
 * 
 * Types:
 * - checkbox: Simple done/not done (e.g., took medication)
 * - rating: Star rating 1-5 (e.g., sleep quality)
 * - number: Numeric input with optional unit (e.g., hours slept)
 * - text: Free text entry (e.g., exercise description)
 * - time: Time picker (e.g., bedtime)
 * - scale: Sliding scale (e.g., mood 1-10)
 */

export const defaultActivities = [
  {
    id: 'sleep-quality',
    name: 'Sleep Quality',
    icon: 'Moon',
    type: 'rating',
    color: 'sand',
    description: 'How well did you sleep?',
    config: {
      maxRating: 5,
      labels: ['Terrible', 'Poor', 'Okay', 'Good', 'Great']
    }
  },
  {
    id: 'sleep-hours',
    name: 'Hours Slept',
    icon: 'Clock',
    type: 'number',
    color: 'sand',
    description: 'How many hours did you sleep?',
    config: {
      min: 0,
      max: 24,
      step: 0.5,
      unit: 'hours',
      defaultValue: 7
    }
  },
  {
    id: 'exercise',
    name: 'Exercise',
    icon: 'Dumbbell',
    type: 'text',
    color: 'grove',
    description: 'What exercise did you do today?',
    config: {
      placeholder: 'e.g., 30 min walk, yoga class...',
    }
  },
  {
    id: 'mood',
    name: 'Mood',
    icon: 'Heart',
    type: 'scale',
    color: 'ember',
    description: 'Where are you on the spectrum?',
    config: {
      min: -4,
      max: 4,
      step: 0.5,
      labels: {
        '-4': 'Depressed',
        '0': 'Baseline',
        '4': 'Manic'
      },
      defaultValue: 0
    }
  },
  {
    id: 'paranoia',
    name: 'Paranoia',
    icon: 'Eye',
    type: 'scale',
    color: 'ember',
    description: 'How paranoid are you feeling?',
    config: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        5: 'Moderate',
        10: 'Severe'
      },
      defaultValue: 0
    }
  },
  {
    id: 'scrambled-brains',
    name: 'Scrambled Brains',
    icon: 'Brain',
    type: 'scale',
    color: 'ember',
    description: 'How scattered is your thinking?',
    config: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        5: 'Moderate',
        10: 'Severe'
      },
      defaultValue: 0
    }
  },
  {
    id: 'journaling',
    name: 'Journaling',
    icon: 'BookOpen',
    type: 'checkbox',
    color: 'calm',
    description: 'Did you journal today?',
    config: {}
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: 'StickyNote',
    type: 'text',
    color: 'sand',
    description: 'Anything to note about today?',
    config: {
      placeholder: 'Optional notes...',
      multiline: true,
      optional: true
    }
  }
];
