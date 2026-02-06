"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRefreshContext } from '@/contexts/refresh-context';

interface CampaignPerformanceData {
  name: string;
  openRate: number;
}

interface CampaignPerformanceResponse {
  success: boolean;
  data: CampaignPerformanceData[];
  lastUpdated?: string;
  error?: string;
}

interface UseCampaignPerformanceOptions {
  pollingInterval?: number; // default 120000 (2 minutes)
  autoPoll?: boolean; // default true
}

export function useCampaignPerformance(options: UseCampaignPerformanceOptions = {}) {
  // Increased default to 5 minutes to avoid Google Sheets API quota limits
  const { pollingInterval = 300000, autoPoll: optionAutoPoll = true } = options;
  const { autoRefresh } = useRefreshContext();
  const autoPoll = optionAutoPoll && autoRefresh;

  const [data, setData] = useState<CampaignPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryDelay, setRetryDelay] = useState(300000);

  const fetchData = useCallback(async () => {
    // Skip fetch if quota is exceeded
    if (quotaExceeded) {
      console.log('Skipping campaign performance fetch - quota exceeded, waiting for retry');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/campaign-performance');

      if (!response.ok) {
        let errorMessage = 'Failed to fetch campaign performance data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: CampaignPerformanceResponse = await response.json();

      if (result.success) {
        setData(result.data || []);
        setLastUpdated(result.lastUpdated || new Date().toISOString());
        setError(null);
        setQuotaExceeded(false);
        setRetryDelay(300000);
      } else {
        const errorMsg = result.error || 'Failed to fetch campaign performance data';
        setError(errorMsg);
        setData([]);
      }
    } catch (err: any) {
      console.error('Error fetching campaign performance data:', err);
      let errorMessage = err.message || 'Failed to fetch campaign performance data';

      if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
        errorMessage = 'API quota exceeded. Auto-refresh paused. Will retry in 5 minutes.';
        setQuotaExceeded(true);
        setRetryDelay(prev => Math.min(prev * 1.5, 600000));
        
        setTimeout(() => {
          setQuotaExceeded(false);
          fetchData();
        }, retryDelay);
      }

      setError(errorMessage);
      if (!errorMessage.includes('quota')) {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [quotaExceeded, retryDelay]);

  useEffect(() => {
    fetchData();
    if (autoPoll && !quotaExceeded) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval, autoPoll, quotaExceeded]);

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


