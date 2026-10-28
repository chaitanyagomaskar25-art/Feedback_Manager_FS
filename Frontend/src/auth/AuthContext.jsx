import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    const handleExpiredSession = () => {
      window.localStorage.removeItem("feedback-token");
      setUser(null);
    };
    window.addEventListener("feedback:session-expired", handleExpiredSession);

    const token = window.localStorage.getItem("feedback-token");
    if (!token) {
      setIsLoading(false);
      return () => window.removeEventListener("feedback:session-expired", handleExpiredSession);
    }

    apiRequest("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error) => {
        if (error.status === 401) {
          window.localStorage.removeItem("feedback-token");
          setUser(null);
        } else {
          setSessionError("We couldn't verify your saved session. Check your connection and refresh.");
        }
      })
      .finally(() => setIsLoading(false));
    return () => window.removeEventListener("feedback:session-expired", handleExpiredSession);
  }, []);

  const authenticate = useCallback(async (endpoint, credentials) => {
    const result = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    window.localStorage.setItem("feedback-token", result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const signIn = useCallback((credentials) => authenticate("/auth/login", credentials), [authenticate]);
  const signUp = useCallback((credentials) => authenticate("/auth/register", credentials), [authenticate]);
  const signOut = useCallback(() => {
    window.localStorage.removeItem("feedback-token");
    setUser(null);
  }, []);
  const value = useMemo(() => ({
    user,
    isLoading,
    sessionError,
    signIn,
    signUp,
    signOut,
    isManager: user?.role === "admin" || user?.role === "manager",
    isAdmin: user?.role === "admin",
  }), [isLoading, sessionError, signIn, signOut, signUp, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
};
