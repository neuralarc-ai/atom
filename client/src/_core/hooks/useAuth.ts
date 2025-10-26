import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, signOut } from "@/lib/supabase";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = '/login' } = options ?? {};
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log('Checking authentication...');
        
        // Check localStorage first
        const localAuth = localStorage.getItem("atom_admin_token") === "authenticated";
        if (!localAuth) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Verify with server
        const userData = await getCurrentUser();
        console.log('User data received:', userData);
        
        if (userData) {
          setUser(userData);
        } else {
          // Clear invalid auth state
          localStorage.removeItem("atom_admin_token");
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setError(error as Error);
        setUser(null);
        // Clear invalid auth state on error
        localStorage.removeItem("atom_admin_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      // Clear localStorage tokens
      localStorage.removeItem("atom_admin_token");
      localStorage.removeItem("manus-runtime-user-info");
      // Redirect to landing page
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
      setError(error as Error);
      // Even if logout fails, clear local state and redirect
      localStorage.removeItem("atom_admin_token");
      localStorage.removeItem("manus-runtime-user-info");
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  // Store user info in localStorage for compatibility
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name || user.email,
        })
      );
    } else {
      localStorage.removeItem("manus-runtime-user-info");
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    logout,
    refresh: () => getCurrentUser().then(setUser),
  };
}
