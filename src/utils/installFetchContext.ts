const API_HINTS = ["/api/", "localhost:5001", "amarneerfuelstationbackend.onrender.com"];

const shouldAttachContext = (input: RequestInfo | URL) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  return API_HINTS.some((hint) => url.includes(hint));
};

export const installFetchContext = () => {
  const originalFetch = window.fetch.bind(window);
  if ((window as any).__pump_context_fetch_installed__) return;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!shouldAttachContext(input)) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init?.headers || {});
    const role = localStorage.getItem("userRole") || "";
    const userId = localStorage.getItem("userId") || "";
    const username = localStorage.getItem("username") || "";
    const selectedPumpId = localStorage.getItem("selectedPumpId") || "";

    if (role) headers.set("x-user-role", role);
    if (userId) headers.set("x-user-id", userId);
    if (username) headers.set("x-user-name", username);
    if (selectedPumpId) headers.set("x-pump-id", selectedPumpId);

    return originalFetch(input, { ...init, headers });
  };

  (window as any).__pump_context_fetch_installed__ = true;
};
