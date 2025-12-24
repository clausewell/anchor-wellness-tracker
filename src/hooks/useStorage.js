import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, USER_ID } from '../lib/supabase';

/**
 * Get today's date as a string key (YYYY-MM-DD)
 */
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Hook for managing daily entries with Supabase
 */
export function useDailyEntries() {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  
  const dateKey = getTodayKey();

  // Load today's entries from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    async function loadTodayEntries() {
      try {
        const { data, error } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', USER_ID)
          .eq('log_date', dateKey);

        if (error) throw error;

        // Convert to our format: { activityId: { value, updatedAt } }
        const entriesMap = {};
        data?.forEach(entry => {
          // Determine the value based on which column has data
          let value;
          if (entry.value_boolean !== null) {
            value = entry.value_boolean;
          } else if (entry.value_number !== null) {
            value = entry.value_number;
          } else if (entry.value_text !== null) {
            value = entry.value_text;
          } else if (entry.value_json !== null) {
            value = entry.value_json;
          }

          entriesMap[entry.activity_id] = {
            value,
            updatedAt: entry.updated_at
          };
        });

        setEntries(prev => ({
          ...prev,
          [dateKey]: entriesMap
        }));

      } catch (error) {
        console.error('Error loading daily entries:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTodayEntries();
  }, [dateKey]);

  /**
   * Get entries for a specific date
   */
  const getEntriesForDate = useCallback((date) => {
    return entries[date] || {};
  }, [entries]);

  /**
   * Set an entry for a specific date and activity
   */
  const setEntryForDate = useCallback(async (date, activityId, value) => {
    // Optimistic update
    setEntries(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [activityId]: {
          value,
          updatedAt: new Date().toISOString()
        }
      }
    }));

    if (!isSupabaseConfigured()) return;

    try {
      // Determine which value column to use
      const valueColumns = {
        value_boolean: null,
        value_number: null,
        value_text: null,
        value_json: null
      };

      if (typeof value === 'boolean') {
        valueColumns.value_boolean = value;
      } else if (typeof value === 'number') {
        valueColumns.value_number = value;
      } else if (typeof value === 'string') {
        valueColumns.value_text = value;
      } else if (typeof value === 'object') {
        valueColumns.value_json = value;
      }

      const { error } = await supabase
        .from('daily_entries')
        .upsert({
          user_id: USER_ID,
          log_date: date,
          activity_id: activityId,
          ...valueColumns,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,log_date,activity_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving daily entry:', error);
    }
  }, []);

  /**
   * Get today's entries
   */
  const getTodayEntries = useCallback(() => {
    return getEntriesForDate(dateKey);
  }, [getEntriesForDate, dateKey]);

  /**
   * Set an entry for today
   */
  const setTodayEntry = useCallback((activityId, value) => {
    return setEntryForDate(dateKey, activityId, value);
  }, [setEntryForDate, dateKey]);

  return {
    entries,
    loading,
    getEntriesForDate,
    setEntryForDate,
    getTodayEntries,
    setTodayEntry
  };
}
