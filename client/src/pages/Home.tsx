import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";

/**
 * All content in this page are only for example, delete if unneeded
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  // If theme is switchable in App.tsx, we can implement theme toggling like this:
  // const { theme, toggleTheme } = useTheme();

  // Use APP_LOGO (as image src) and APP_TITLE if needed

  // Redirect to admin dashboard if authenticated
  if (isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">{APP_TITLE}</h1>
        <p className="text-lg text-muted-foreground">
          Internal HR Portal for Neural Arc Inc.
        </p>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
            Sign In to Continue
          </Button>
        )}
      </div>
    </div>
  );
}
