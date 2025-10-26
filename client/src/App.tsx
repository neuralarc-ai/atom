import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import JobsPage from "./pages/JobsPage";
import TestsPage from "./pages/TestsPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateResultsPage from "./pages/CandidateResultsPage";
import TestPage from "./pages/TestPage";
import TestRedirect from "./pages/TestRedirect";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/login"} component={LandingPage} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/jobs"} component={JobsPage} />
      <Route path={"/admin/tests"} component={TestsPage} />
      <Route path={"/admin/candidates"} component={CandidatesPage} />
      <Route path="/admin/candidates/:id" component={CandidateResultsPage} />
      <Route path={"/test/:testId"} component={TestPage} />
      <Route path={"/t/:code"} component={TestRedirect} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="app-transition">
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
