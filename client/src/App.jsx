import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  // Show a loading spinner while Auth0 checks if the user is logged in
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If logged in, show Dashboard. If not, show Landing Page.
  return <>{isAuthenticated ? <Dashboard /> : <LandingPage />}</>;
}

export default App;
