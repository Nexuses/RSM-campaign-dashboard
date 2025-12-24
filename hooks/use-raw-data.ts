"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRefreshContext } from '@/contexts/refresh-context';

interface RawDataResponse {
  success: boolean;
  data: any[];
  headers?: string[];
  lastUpdated?: string;
  error?: string;
}

interface UseRawDataOptions {
  sheetName: string;
  pollingInterval?: number; // default 120000 (2 minutes)
  autoPoll?: boolean; // default true
}

export function useRawData(options: UseRawDataOptions) {
  const { sheetName, pollingInterval = 120000, autoPoll: optionAutoPoll = true } = options;
  const { autoRefresh } = useRefreshContext();
  const autoPoll = optionAutoPoll && autoRefresh;

  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!sheetName) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`/api/sheets/raw-data?sheetName=${encodeURIComponent(sheetName)}`);

      if (!response.ok) {
        let errorMessage = 'Failed to fetch raw data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: RawDataResponse = await response.json();

      if (result.success) {
        setData(result.data || []);
        setHeaders(result.headers || []);
        setLastUpdated(result.lastUpdated || new Date().toISOString());
        setError(null);
      } else {
        const errorMsg = result.error || 'Failed to fetch raw data';
        setError(errorMsg);
        setData([]);
        setHeaders([]);
      }
    } catch (err: any) {
      console.error('Error fetching raw data:', err);
      let errorMessage = err.message || 'Failed to fetch raw data';

      if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
        errorMessage = 'API quota exceeded. Please wait a few minutes before refreshing.';
      }

      setError(errorMessage);
      if (!errorMessage.includes('quota')) {
        setData([]);
        setHeaders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [sheetName]);

  useEffect(() => {
    fetchData();
    if (autoPoll && sheetName) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval, autoPoll, sheetName]);

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
    headers,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}


