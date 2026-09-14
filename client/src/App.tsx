import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CinemaHome from "./pages/CinemaHome";
import Cart from "./pages/Cart";
import UpcomingReleasesPage from "./pages/UpcomingReleasesPage";
import MovieDetailPage from "./pages/MovieDetailPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/cinema" component={CinemaHome} />
      <Route path="/cart" component={Cart} />
      <Route path="/proximos-estrenos" component={UpcomingReleasesPage} />
      <Route path="/proximos-estrenos/:id" component={MovieDetailPage} />
      <Route path="/coming-soon" component={UpcomingReleasesPage} />
      <Route path="/coming-soon/:id" component={MovieDetailPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
