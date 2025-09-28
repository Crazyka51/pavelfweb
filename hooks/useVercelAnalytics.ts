"use client";

import { useState, useEffect, useCallback } from 'react';

interface VercelAnalyticsData {
  pageViews: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
    trend: number;
  };
  visitors: {
    total: number;
    unique: number;
    returning: number;
    newVisitors: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    title: string;
    uniqueViews: number;
  }>;
  referrers: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locations: Array<{
    country: string;
    city?: string;
    visits: number;
  }>;
  timeRange: {
    from: string;
    to: string;
  };
}

export function useVercelAnalytics(period: string = '30d') {
  const [data, setData] = useState<VercelAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      let fromDate: Date;

      switch (period) {
        case '7d':
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case '30d':
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          break;
        case '90d':
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
          break;
        default:
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      }

      // Try Vercel Analytics API first
      const vercelResponse = await fetch(`/api/admin/vercel-analytics?from=${fromDate.toISOString()}&to=${now.toISOString()}`, {
        credentials: 'include',
      });

      if (vercelResponse.ok) {
        const vercelData = await vercelResponse.json();
        setData(vercelData);
        return;
      }

      // Fallback to local analytics API
      const localResponse = await fetch(`/api/admin/analytics?from=${fromDate.toISOString()}&to=${now.toISOString()}`, {
        credentials: 'include',
      });

      if (localResponse.ok) {
        const localData = await localResponse.json();
        setData(localData);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Set fallback data
      setData({
        pageViews: {
          total: 0,
          thisMonth: 0,
          thisWeek: 0,
          today: 0,
          trend: 0
        },
        visitors: {
          total: 0,
          unique: 0,
          returning: 0,
          newVisitors: 0
        },
        topPages: [],
        referrers: [],
        devices: {
          desktop: 0,
          mobile: 0,
          tablet: 0
        },
        locations: [],
        timeRange: {
          from: new Date().toISOString(),
          to: new Date().toISOString()
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, isLoading, error, refresh: fetchAnalytics };
}
