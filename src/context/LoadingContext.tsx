// src/context/LoadingContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
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

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeCount, setActiveCount] = useState(0);
  const REQUEST_TIMEOUT_MS = 20000;
  const startLoading = () => setActiveCount((count) => count + 1);
  const stopLoading = () => setActiveCount((count) => Math.max(0, count - 1));
  const reset = () => setActiveCount(0);

  useEffect(() => {
    // Patch window.fetch
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [input, init] = args as [RequestInfo | URL, RequestInit | undefined];
      let timeoutId: number | null = null;
      let finalInit = init;

      if (!init?.signal) {
        const controller = new AbortController();
        finalInit = { ...init, signal: controller.signal };
        timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      }

      try {
        startLoading();
        const res = await origFetch(input, finalInit);
        return res;
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
        stopLoading();
      }
    };

    // Add axios interceptors (if axios present)
    const reqInterceptor = axios.interceptors.request.use((cfg) => {
      cfg.timeout = cfg.timeout ?? REQUEST_TIMEOUT_MS;
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
