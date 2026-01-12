"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRefreshContext } from '@/contexts/refresh-context';

interface StatsData {
  totalProspects: string;
  hotLeads: string;
  activePipeline: string;
  avgOpenRate: string;
}

interface StatsResponse {
  success: boolean;
  stats: StatsData;
  lastUpdated?: string;
  error?: string;
}

interface UseStatsOptions {
  pollingInterval?: number; // in milliseconds, default 120000 (2 minutes)
  autoPoll?: boolean; // default true
  filter?: string; // default, last7days, last30days, lastyear, custom
  startDate?: string; // For custom date range
  endDate?: string; // For custom date range
}

export function useStats(options: UseStatsOptions = {}) {
  const { pollingInterval = 120000, autoPoll: optionAutoPoll = true, filter = 'default', startDate, endDate } = options;
  const { autoRefresh } = useRefreshContext();
  const autoPoll = optionAutoPoll && autoRefresh;
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter && filter !== 'default') {
        params.append('filter', filter);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      const url = `/api/stats${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch stats';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: StatsResponse = await response.json();
      
      if (result.success) {
        setStats(result.stats || {
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        });
        setLastUpdated(result.lastUpdated || new Date().toISOString());
        setError(null);
      } else {
        const errorMsg = result.error || 'Failed to fetch stats';
        setError(errorMsg);
        setStats({
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        });
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      let errorMessage = err.message || 'Failed to fetch stats';
      
      // Handle quota errors specifically
      if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
        errorMessage = 'API quota exceeded. Please wait a few minutes before refreshing. The dashboard will auto-update when quota resets.';
      }
      
      setError(errorMessage);
      // Keep existing stats on error
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate]);

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
    stats,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}


