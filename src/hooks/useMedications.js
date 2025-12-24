import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, USER_ID } from '../lib/supabase';

/**
 * Default medications configuration (Brett's meds)
 */
export const defaultMedications = {
  daytime: [
    {
      id: 'propranolol',
      name: 'Propranolol',
      dosage: '20mg',
      dosageValue: 20,
      dosageUnit: 'mg',
      timesPerDay: 2,
      trackTime: true,
      dosageAdjustable: false,
      sortOrder: 1
    },
    {
      id: 'xanax-xr',
      name: 'Xanax XR',
      dosage: '2mg',
      dosageValue: 2,
      dosageUnit: 'mg',
      timesPerDay: 2,
      trackTime: true,
      dosageAdjustable: false,
      sortOrder: 2
    }
  ],
  evening: [
    {
      id: 'rexulti',
      name: 'Rexulti',
      dosage: '2mg',
      dosageValue: 2,
      dosageUnit: 'mg',
      dosageAdjustable: true,
      sortOrder: 1
    },
    {
      id: 'lithium',
      name: 'Lithium',
      dosage: '1050mg',
      dosageValue: 1050,
      dosageUnit: 'mg',
      dosageAdjustable: true,
      sortOrder: 2
    },
    {
      id: 'lamictal',
      name: 'Lamictal',
      dosage: '200mg',
      dosageValue: 200,
      dosageUnit: 'mg',
      dosageAdjustable: false,
      sortOrder: 3
    },
    {
      id: 'fish-oil',
      name: 'Fish Oil',
      dosage: null,
      dosageAdjustable: false,
      sortOrder: 4
    },
    {
      id: 'multi-vitamin',
      name: 'Multi Vitamin',
      dosage: null,
      dosageAdjustable: false,
      sortOrder: 5
    }
  ]
};

/**
 * Get today's date as YYYY-MM-DD in local timezone
 */
export function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Hook for managing medication logs with Supabase
 */
export function useMedicationLogs() {
  const [todayLogs, setTodayLogs] = useState({});
  const [todayEveningTime, setTodayEveningTimeState] = useState(null);
  const [todayExtraMeds, setTodayExtraMedsState] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const dateKey = getTodayDateKey();

  // Load today's data from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('Load: Supabase not configured');
      setLoading(false);
      return;
    }

    async function loadTodayData() {
      console.log('Loading data for date:', dateKey);
      try {
        // Load medication logs
        const { data: logs, error: logsError } = await supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', USER_ID)
          .eq('log_date', dateKey);

        console.log('Loaded logs:', logs, 'Error:', logsError);
        if (logsError) throw logsError;

        // Convert to our format: { "medId-doseNum": { taken, takenAt, dosageValue } }
        const logsMap = {};
        logs?.forEach(log => {
          const key = `${log.medication_id}-${log.dose_number}`;
          logsMap[key] = {
            taken: log.taken,
            takenAt: log.taken_at,
            dosageValue: log.dosage_value_taken
          };
        });
        console.log('Processed logsMap:', logsMap);
        setTodayLogs(logsMap);

        // Load evening time
        const { data: eveningData, error: eveningError } = await supabase
          .from('evening_med_times')
          .select('taken_at')
          .eq('user_id', USER_ID)
          .eq('log_date', dateKey)
          .single();

        if (eveningError && eveningError.code !== 'PGRST116') throw eveningError;
        setTodayEveningTimeState(eveningData?.taken_at || null);

        // Load extra meds
        const { data: extraMeds, error: extraError } = await supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', USER_ID)
          .eq('log_date', dateKey)
          .not('custom_med_name', 'is', null);

        if (extraError) throw extraError;
        
        const extras = extraMeds?.map(m => ({
          id: m.id,
          name: m.custom_med_name,
          dosage: m.dosage_taken,
          takenAt: m.taken_at
        })) || [];
        setTodayExtraMedsState(extras);

      } catch (error) {
        console.error('Error loading medication data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTodayData();
  }, [dateKey]);

  /**
   * Toggle a medication dose
   */
  const toggleDose = useCallback(async (medicationId, doseNumber) => {
    console.log('toggleDose called:', medicationId, doseNumber);
    console.log('isSupabaseConfigured:', isSupabaseConfigured());
    const key = `${medicationId}-${doseNumber}`;
    const current = todayLogs[key];
    const wasTaken = current?.taken || false;
    const newTaken = !wasTaken;
    const newTakenAt = newTaken ? new Date().toISOString() : null;

    // Optimistic update
    setTodayLogs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        taken: newTaken,
        takenAt: newTakenAt
      }
    }));

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping save');
      return;
    }

    console.log('Saving to Supabase...');
    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .upsert({
          user_id: USER_ID,
          medication_id: medicationId,
          log_date: dateKey,
          dose_number: doseNumber,
          taken: newTaken,
          taken_at: newTakenAt,
          dosage_value_taken: current?.dosageValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,medication_id,log_date,dose_number'
        });

      console.log('Supabase response:', { data, error });
      if (error) throw error;
    } catch (error) {
      console.error('Error saving medication log:', error);
      // Revert on error
      setTodayLogs(prev => ({
        ...prev,
        [key]: current
      }));
    }
  }, [todayLogs, dateKey]);

  /**
   * Update the time for a dose
   */
  const updateDoseTime = useCallback(async (medicationId, doseNumber, time) => {
    const key = `${medicationId}-${doseNumber}`;
    const current = todayLogs[key];

    // Optimistic update
    setTodayLogs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        takenAt: time
      }
    }));

    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('medication_logs')
        .upsert({
          user_id: USER_ID,
          medication_id: medicationId,
          log_date: dateKey,
          dose_number: doseNumber,
          taken: current?.taken || true,
          taken_at: time,
          dosage_value_taken: current?.dosageValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,medication_id,log_date,dose_number'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating dose time:', error);
    }
  }, [todayLogs, dateKey]);

  /**
   * Update dosage for adjustable meds
   */
  const updateDosage = useCallback(async (medicationId, doseNumber, dosageValue) => {
    const key = `${medicationId}-${doseNumber}`;
    const current = todayLogs[key];

    // Optimistic update
    setTodayLogs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        dosageValue
      }
    }));

    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('medication_logs')
        .upsert({
          user_id: USER_ID,
          medication_id: medicationId,
          log_date: dateKey,
          dose_number: doseNumber,
          taken: current?.taken || false,
          taken_at: current?.takenAt,
          dosage_value_taken: dosageValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,medication_id,log_date,dose_number'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating dosage:', error);
    }
  }, [todayLogs, dateKey]);

  /**
   * Set evening meds batch time
   */
  const setEveningTime = useCallback(async (time) => {
    // Optimistic update
    setTodayEveningTimeState(time);

    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('evening_med_times')
        .upsert({
          user_id: USER_ID,
          log_date: dateKey,
          taken_at: time
        }, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving evening time:', error);
    }
  }, [dateKey]);

  /**
   * Add an extra/PRN medication
   */
  const addExtraMed = useCallback(async (med) => {
    const newMed = {
      id: `extra-${Date.now()}`,
      name: med.name,
      dosage: med.dosage,
      takenAt: med.takenAt || new Date().toISOString()
    };

    // Optimistic update
    setTodayExtraMedsState(prev => [...prev, newMed]);

    if (!isSupabaseConfigured()) return newMed;

    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: USER_ID,
          log_date: dateKey,
          dose_number: 1,
          taken: true,
          taken_at: newMed.takenAt,
          custom_med_name: med.name,
          dosage_taken: med.dosage
        })
        .select()
        .single();

      if (error) throw error;

      // Update with real ID
      setTodayExtraMedsState(prev => 
        prev.map(m => m.id === newMed.id ? { ...m, id: data.id } : m)
      );

      return { ...newMed, id: data.id };
    } catch (error) {
      console.error('Error adding extra med:', error);
      return newMed;
    }
  }, [dateKey]);

  /**
   * Remove an extra med
   */
  const removeExtraMed = useCallback(async (extraMedId) => {
    // Optimistic update
    setTodayExtraMedsState(prev => prev.filter(m => m.id !== extraMedId));

    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('medication_logs')
        .delete()
        .eq('id', extraMedId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing extra med:', error);
    }
  }, []);

  /**
   * Get log for a specific dose
   */
  const getDoseLog = useCallback((medicationId, doseNumber) => {
    const key = `${medicationId}-${doseNumber}`;
    return todayLogs[key] || null;
  }, [todayLogs]);

  /**
   * Check if a dose was taken
   */
  const isDoseTaken = useCallback((medicationId, doseNumber) => {
    const log = getDoseLog(medicationId, doseNumber);
    return log?.taken || false;
  }, [getDoseLog]);

  return {
    // Data
    todayLogs,
    todayEveningTime,
    todayExtraMeds,
    loading,

    // Actions
    toggleDose,
    updateDoseTime,
    updateDosage,
    setEveningTime,
    addExtraMed,
    removeExtraMed,

    // Queries
    getDoseLog,
    isDoseTaken
  };
}
