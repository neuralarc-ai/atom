import LandingPage from "./LandingPage";

/**
 * Home page - Shows landing page with custom login
 */
export default function Home() {
  // Check if user is already authenticated via custom auth
  const isAuthenticated = localStorage.getItem("atom_admin_token") === "authenticated";
  
  // Redirect to admin dashboard if authenticated
  if (isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  return <LandingPage />;
}

