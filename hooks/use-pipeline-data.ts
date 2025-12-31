"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRefreshContext } from '@/contexts/refresh-context';

interface PipelineData {
  [key: string]: any; // Flexible structure for pipeline data
}

interface PipelineResponse {
  success: boolean;
  data: PipelineData[];
  lastUpdated?: string;
  error?: string;
}

interface UsePipelineDataOptions {
  pollingInterval?: number;
  autoPoll?: boolean;
}

export function usePipelineData(options: UsePipelineDataOptions = {}) {
  // Increased default to 2 minutes to avoid Google Sheets API quota limits
  const { pollingInterval = 120000, autoPoll: optionAutoPoll = true } = options;
  const { autoRefresh } = useRefreshContext();
  const autoPoll = optionAutoPoll && autoRefresh;
  
  const [data, setData] = useState<PipelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/sheets/pipeline');
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch pipeline data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: PipelineResponse = await response.json();
      
      if (result.success) {
        setData(result.data || []);
        setLastUpdated(result.lastUpdated || new Date().toISOString());
        setError(null);
      } else {
        const errorMsg = result.error || 'Failed to fetch pipeline data';
        setError(errorMsg);
        setData([]);
      }
    } catch (err: any) {
      console.error('Error fetching pipeline data:', err);
      let errorMessage = err.message || 'Failed to fetch pipeline data';
      
      // Handle quota errors specifically
      if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
        errorMessage = 'API quota exceeded. Please wait a few minutes before refreshing.';
      }
      
      setError(errorMessage);
      // Don't clear existing data on quota errors
      if (!errorMessage.includes('quota')) {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (autoPoll) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval, autoPoll]);

  // Listen for manual refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}


