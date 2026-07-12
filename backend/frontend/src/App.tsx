import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

export default function App() {
  const [view, setView] = useState<"landing" | "auth">("landing");

  return (
    <>
      <SignedIn>
        <Home />
      </SignedIn>
      <SignedOut>
        {view === "landing" ? (
          <LandingPage
            onGetStarted={() => setView("auth")}
            onUploadFile={() => setView("auth")}
          />
        ) : (
          <AuthPage onBack={() => setView("landing")} />
        )}
      </SignedOut>
    </>
  );
}
