import { CheckCircle2, Circle } from 'lucide-react';

export default function DailyProgress({ activities, entries }) {
  // Calculate completion stats
  const requiredActivities = activities.filter(a => !a.config?.optional);
  
  const isComplete = (activity) => {
    const value = entries[activity.id]?.value;
    if (activity.type === 'checkbox') return value === true;
    if (activity.type === 'rating') return value > 0;
    if (activity.type === 'text') return value && value.trim().length > 0;
    if (activity.type === 'number' || activity.type === 'scale') return value !== undefined;
    return false;
  };
  
  const completedCount = requiredActivities.filter(isComplete).length;
  const totalRequired = requiredActivities.length;
  const percentage = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;
  
  // Encouraging messages based on progress
  const getMessage = () => {
    if (percentage === 0) return "Ready to start your day?";
    if (percentage < 50) return "You're making progress!";
    if (percentage < 100) return "Almost there, keep going!";
    return "Amazing! You've completed everything.";
  };
  
  return (
    <div className="mx-5 mb-6 p-5 rounded-2xl bg-gradient-to-br from-calm-500 to-calm-600 text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-semibold text-lg">
            Today's Progress
          </h2>
          <p className="text-calm-100 text-sm mt-0.5">
            {getMessage()}
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-display font-bold">{percentage}%</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-calm-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Activity dots */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {requiredActivities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-center gap-1"
            title={activity.name}
          >
            {isComplete(activity) ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Circle className="w-4 h-4 text-calm-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
