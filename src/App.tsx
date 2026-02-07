import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { ToastContainer } from "./components/ui/Toast";
import { OfflineBanner } from "./components/pwa/OfflineBanner";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { ChatWidget } from "./components/chat/ChatWidget";
import { useAuthStore } from "./stores/authStore";
import { SEO } from "./components/SEO";

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
const Profile = React.lazy(() =>
  import("./pages/Profile").then((module) => ({
    default: module.Profile,
  }))
);
const StaffManagement = React.lazy(() =>
  import("./pages/StaffManagement").then((module) => ({
    default: module.StaffManagement,
  }))
);
const Settings = React.lazy(() =>
  import("./pages/Settings").then((module) => ({
    default: module.Settings,
  }))
);
const Statistics = React.lazy(() =>
  import("./pages/Statistics").then((module) => ({
    default: module.Statistics,
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
  const location = useLocation();

  return (
    <div className="app">
      <SEO 
        title="BookFlow Pro - Premium Booking" 
        description="Rezervujte si váš termín rýchlo a bezpečne."
      />
      <Header />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Routes location={location}>
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
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute>
                      <StaffManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/statistics"
                  element={
                    <ProtectedRoute>
                      <Statistics />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <BottomNav />
      <ChatWidget />
      <Sidebar />
      <ToastContainer />
      <OfflineBanner />
      <InstallPrompt />
    </div>
  );
}

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default Root;
