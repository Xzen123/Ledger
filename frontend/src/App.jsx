import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Shop from "./pages/Shop.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Landing from "./pages/Landing.jsx";
import AppShell from "./components/AppShell.jsx";

function MainRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-mute text-sm">Loading your character…</p>
      </div>
    );
  }

  // If unauthenticated, show the Scrollytelling Landing Page
  if (status === "anon") {
    return <Landing />;
  }

  // If authenticated, show the Dashboard inside AppShell
  return (
    <AppShell />
  );
}

function ProtectedLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-mute text-sm">Loading your character…</p>
      </div>
    );
  }
  if (status === "anon") return <Navigate to="/login" replace />;
  return <AppShell />;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/quests" element={<Tasks />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
        <Route path="/" element={<MainRoute />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}


/* commit_stage_44_ayush */
