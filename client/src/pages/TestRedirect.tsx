import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Redirect page for short test URLs
 * Handles /t/:code and redirects to /test/:testId
 */
export default function TestRedirect() {
  const { code } = useParams();
  const [, setLocation] = useLocation();
  
  // Fetch test by short code
  const { data: test, isLoading, error } = useQuery({
    queryKey: ['tests', 'shortCode', code],
    queryFn: () => api.tests.getByShortCode(code || ""),
    enabled: !!code,
  });

  useEffect(() => {
    if (!isLoading && test) {
      // Redirect to the actual test page
      setLocation(`/test/${test.id}`);
    } else if (!isLoading && !test && code) {
      // If code not found, show error
      alert("Invalid or expired test link");
      setLocation("/");
    }
  }, [test, isLoading, code, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading test</p>
          <button 
            onClick={() => setLocation("/")}
            className="mt-4 px-4 py-2 bg-[#FF6347] text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6347] mx-auto mb-4"></div>
        <p className="text-lg text-[#1B5E20]">Loading test...</p>
      </div>
    </div>
  );
}

