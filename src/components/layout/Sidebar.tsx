import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import {
  X,
  User,
  Calendar,
  Settings,
  LogOut,
  Shield,
  PieChart,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../ui/Button";

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, closeSidebar]);

  // Handle logout
  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    closeSidebar();
    navigate(path);
  };

  const sidebarVariants: Variants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const itemVariants = {
    closed: { x: 50, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.05 + 0.2 },
    }),
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed right-0 top-0 h-full w-[85vw] max-w-[350px] bg-background-paper border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary-light/10 to-transparent">
              <h2 className="text-xl font-display font-bold text-gradient-primary">
                Menu
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="hover:bg-red-500/10 hover:text-red-400"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Profile Card */}
              {user ? (
                <motion.div
                  custom={0}
                  variants={itemVariants}
                  className="bg-background-main p-4 rounded-2xl border border-white/5 shadow-inner"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-xl font-bold">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-xs text-text-secondary">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleNavigation("/profile")}
                    >
                      <User size={14} className="mr-2" />
                      Profil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-white/10"
                      onClick={toggleTheme}
                    >
                      {theme.mode === "dark" ? (
                        <Sun size={14} className="mr-2" />
                      ) : (
                        <Moon size={14} className="mr-2" />
                      )}
                      {theme.mode === "dark" ? "Light" : "Dark"}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  custom={0}
                  variants={itemVariants}
                  className="text-center p-6 bg-background-main rounded-2xl border border-white/5"
                >
                  <p className="text-text-secondary mb-4">
                    Prihláste sa pre prístup k rezerváciám
                  </p>
                  <Button
                    onClick={() => handleNavigation("/login")}
                    className="w-full shadow-glow"
                  >
                    Prihlásiť sa
                  </Button>
                </motion.div>
              )}

              {/* Menu Links */}
              <div className="space-y-2">
                <MenuItem
                  icon={<Calendar size={20} />}
                  label="Moje rezervácie"
                  onClick={() => handleNavigation("/my-bookings")}
                  index={1}
                  active={location.pathname === "/my-bookings"}
                />

                {user?.role === "admin" && (
                  <>
                    <div className="h-px bg-white/5 my-2 mx-4" />
                    <p className="px-4 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Admin zóna
                    </p>

                    <MenuItem
                      icon={<PieChart size={20} />}
                      label="Dashboard"
                      onClick={() => handleNavigation("/dashboard")}
                      index={2}
                    />
                    <MenuItem
                      icon={<User size={20} />}
                      label="Zamestnanci"
                      onClick={() => handleNavigation("/staff")}
                      index={3}
                    />
                    <MenuItem
                      icon={<Settings size={20} />}
                      label="Nastavenia"
                      onClick={() => handleNavigation("/settings")}
                      index={4}
                    />
                  </>
                )}
              </div>

              {/* Info Section */}
              <motion.div
                custom={5}
                variants={itemVariants}
                className="bg-primary-500/5 p-4 rounded-xl border border-primary-500/10"
              >
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-bold text-sm text-primary-300">
                      Bezpečné rezervácie
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Vaše údaje sú chránené najmodernejším šifrovaním.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            {user && (
              <div className="p-6 border-t border-white/5 bg-background-main">
                <Button
                  variant="ghost"
                  className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut size={20} className="mr-3" />
                  Odhlásiť sa
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper Component for Menu Items
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  index: number;
  active?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  index,
  active,
}) => (
  <motion.button
    custom={index}
    variants={{
      closed: { x: 50, opacity: 0 },
      open: (i) => ({
        x: 0,
        opacity: 1,
        transition: { delay: i * 0.05 + 0.1 },
      }),
    }}
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-xl transition-colors ${
      active
        ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
        : "hover:bg-white/5 text-text-main hover:text-white"
    }`}
  >
    <span className={`${active ? "text-primary-400" : "text-text-secondary"}`}>
      {icon}
    </span>
    <span className="ml-3 font-medium">{label}</span>
  </motion.button>
);
