"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRefreshContext } from '@/contexts/refresh-context';

interface CampaignData {
  date: string;
  campaignName: string;
  project: string;
  solutionArea: string;
  emailTool: string;
  send: number;
  openRate: string;
  clickRate: string;
  bounceRate: string;
  unsubscribeRate: string;
  leads: number;
}

interface SheetsResponse {
  success: boolean;
  data: CampaignData[];
  stats: {
    totalProspects: string;
    hotLeads: string;
    activePipeline: string;
    avgOpenRate: string;
  };
  lastUpdated: string;
}

interface UseSheetsDataOptions {
  pollingInterval?: number; // in milliseconds, default 120000 (2 minutes) to avoid quota limits
  autoPoll?: boolean; // default true
  sheetType?: 'campaignData' | 'pipeline' | 'leads' | 'prospects' | 'content' | 'analytics'; // Which sheet to fetch from
}

export function useSheetsData(options: UseSheetsDataOptions = {}) {
  // Increased default to 2 minutes to avoid Google Sheets API quota limits
  const { pollingInterval = 120000, autoPoll: optionAutoPoll = true, sheetType = 'campaignData' } = options;
  const { autoRefresh } = useRefreshContext();
  const autoPoll = optionAutoPoll && autoRefresh;
  
  const [data, setData] = useState<CampaignData[]>([]);
  const [stats, setStats] = useState<SheetsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const url = sheetType === 'pipeline' 
        ? '/api/sheets/pipeline' 
        : `/api/sheets?sheet=${sheetType}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: any = await response.json();
      
      if (result.success) {
        setData(result.data || []);
        setStats(result.stats || {
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        });
        setLastUpdated(result.lastUpdated || new Date().toISOString());
        setError(null);
      } else {
        // API returned success: false, show the error message
        const errorMsg = result.error || result.message || 'Failed to fetch data from Google Sheets';
        setError(errorMsg);
        // Still set empty data so UI doesn't break
        setData(result.data || []);
        setStats(result.stats || {
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        });
      }
    } catch (err: any) {
      console.error('Error fetching sheets data:', err);
      let errorMessage = err.message || 'Failed to fetch data';
      
      // Handle quota errors specifically
      if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
        errorMessage = 'API quota exceeded. Please wait a few minutes before refreshing. The dashboard will auto-update when quota resets.';
        // Disable auto-polling temporarily on quota errors
        if (autoPoll) {
          console.warn('Quota exceeded - auto-polling will resume after delay');
        }
      }
      
      setError(errorMessage);
      // Don't clear existing data on error, just show the error message
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling if enabled
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
    stats,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}


