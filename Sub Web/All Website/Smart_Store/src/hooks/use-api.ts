/**
 * useApi — generic fetcher hook with fallback to mock data.
 * When the backend is running, returns live data from MongoDB.
 * When the backend is offline, silently falls back to the mockData values.
 */

import { useState, useEffect, useRef } from "react";

interface UseApiOptions<T> {
  /** function that returns a Promise<T> (the API call) */
  fetcher: () => Promise<T>;
  /** fallback value shown while loading or on error (e.g. mock data array) */
  fallback: T;
  /** re-fetch when any of these values change */
  deps?: unknown[];
}

export function useApi<T>({ fetcher, fallback, deps = [] }: UseApiOptions<T>) {
  const [data,    setData]    = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (isMounted.current) setData(result);
      })
      .catch((err) => {
        if (isMounted.current) {
          // Silently use fallback — don't break the UI
          setError(err.message);
          setData(fallback);
        }
      })
      .finally(() => {
        if (isMounted.current) setLoading(false);
      });

    return () => { isMounted.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
