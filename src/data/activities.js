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
      placeholder: 'e.g., 30 min walk, yoga class...'
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
      min: 1,
      max: 10,
      labels: {
        1: 'Depressed',
        5: 'Balanced',
        10: 'Manic'
      },
      defaultValue: 5
    }
  },
  {
    id: 'episode-intensity',
    name: 'Episode Intensity',
    icon: 'Gauge',
    type: 'scale',
    color: 'blush',
    description: 'How intense is any current episode?',
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
