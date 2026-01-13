import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { ToastContainer } from "./components/ui/Toast";
import { OfflineBanner } from "./components/pwa/OfflineBanner";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { ChatWidget } from "./components/chat/ChatWidget";
import { useAuthStore } from "./stores/authStore";

// Lazy Load Pages
const Home = React.lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home }))
);
const Login = React.lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login }))
);
const Book = React.lazy(() =>
  import("./pages/Book").then((module) => ({ default: module.Book }))
);
const Dashboard = React.lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const MyBookings = React.lazy(() =>
  import("./pages/MyBookings").then((module) => ({
    default: module.MyBookings,
  }))
);

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="spinner w-8 h-8 border-primary border-t-transparent animate-spin" />
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="app-main">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/book" element={<Book />} />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
        <ChatWidget />
        <ToastContainer />
        <OfflineBanner />
        <InstallPrompt />
      </div>
    </BrowserRouter>
  );
}

export default App;
