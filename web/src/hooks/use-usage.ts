"use client";

import { useState, useEffect, useCallback } from "react";

interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requestCount: number;
  periodStart: string;
  periodEnd: string;
}

export function useUsage(enabled = true) {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) {
        throw new Error("Failed to fetch usage data");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchUsage();
    }
  }, [enabled, fetchUsage]);

  return { data, isLoading, error, refetch: fetchUsage };
}
