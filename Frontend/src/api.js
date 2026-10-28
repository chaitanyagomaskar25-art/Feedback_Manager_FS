const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_URL = configuredApiUrl.replace(/\/+$/, "");

export const apiRequest = async (path, options = {}) => {
  const token = window.localStorage.getItem("feedback-token");
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("feedback:session-expired"));
    }
    const error = new Error(data?.message || "The request could not be completed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};
