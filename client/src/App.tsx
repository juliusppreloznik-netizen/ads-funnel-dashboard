import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import IntakeForm from "./pages/IntakeForm";
import ThankYou from "./pages/ThankYou";
import AdminDashboard from "./pages/AdminDashboard";
import AssetManagement from "./pages/AssetManagement";
import HTMLEditor from "./pages/HTMLEditor";
import ClientLogin from "./pages/ClientLogin";
import ClientPortal from "./pages/ClientPortal";
import ClientManagement from "./pages/ClientManagement";
import Onboarding from "./pages/Onboarding";
import HelpVideos from "./pages/HelpVideos";
import ClientHelpVideos from "./pages/ClientHelpVideos";
import ChangeRequestButton from "./components/ChangeRequestButton";



function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={IntakeForm} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/assets/:clientId" component={AssetManagement} />
      <Route path="/admin/editor/:assetId" component={HTMLEditor} />
      <Route path="/admin/clients" component={ClientManagement} />
      <Route path="/admin/help-videos" component={HelpVideos} />

      <Route path="/onboarding/:clientId" component={Onboarding} />
      <Route path="/client-login" component={ClientLogin} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/portal/help-videos" component={ClientHelpVideos} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
          <Router />
          <ChangeRequestButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
