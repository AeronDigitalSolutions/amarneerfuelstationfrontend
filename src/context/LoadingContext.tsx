// src/context/LoadingContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";

type LoadingContextType = {
  activeCount: number;
  startLoading: () => void;
  stopLoading: () => void;
  reset: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  activeCount: 0,
  startLoading: () => {},
  stopLoading: () => {},
  reset: () => {},
});

export const useLoader = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode; minShowMs?: number }> = ({
  children,
  minShowMs = 300,
}) => {
  const [activeCount, setActiveCount] = useState(0);
  // ensure minimum visible time to avoid flicker
  const lastShownAtRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);

  const inc = () => setActiveCount((c) => c + 1);
  const dec = () => setActiveCount((c) => Math.max(0, c - 1));
  const reset = () => setActiveCount(0);

  const startLoading = () => {
    // start and record timestamp
    if (activeCount === 0) lastShownAtRef.current = Date.now();
    inc();
  };

  const stopLoading = () => {
    // ensure minimum show time
    const finish = () => {
      dec();
      if (activeCount <= 1) lastShownAtRef.current = null;
    };

    const shownAt = lastShownAtRef.current;
    if (!shownAt) {
      // never recorded, just decrement immediately
      finish();
      return;
    }
    const elapsed = Date.now() - shownAt;
    if (elapsed >= minShowMs) {
      finish();
    } else {
      // wait remaining time
      const remaining = minShowMs - elapsed;
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      showTimerRef.current = window.setTimeout(() => {
        finish();
        showTimerRef.current = null;
      }, remaining);
    }
  };

  useEffect(() => {
    // Patch window.fetch
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        startLoading();
        const res = await origFetch(...args);
        stopLoading();
        return res;
      } catch (err) {
        stopLoading();
        throw err;
      }
    };

    // Add axios interceptors (if axios present)
    const reqInterceptor = axios.interceptors.request.use((cfg) => {
      startLoading();
      return cfg;
    }, (err) => {
      // request failed before sending
      stopLoading();
      return Promise.reject(err);
    });

    const resInterceptor = axios.interceptors.response.use((res) => {
      stopLoading();
      return res;
    }, (err) => {
      stopLoading();
      return Promise.reject(err);
    });

    return () => {
      // restore
      window.fetch = origFetch;
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  return (
    <LoadingContext.Provider
      value={{
        activeCount,
        startLoading,
        stopLoading,
        reset,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
