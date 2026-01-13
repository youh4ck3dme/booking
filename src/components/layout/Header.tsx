import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, User, Calendar } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  // "Luxury Intelligent" Left Button Function
  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === "admin") {
      navigate("/dashboard"); // Admin goes to dashboard for overview
    } else {
      navigate("/book"); // Users go to booking
    }
  };

  return (
    <header className="app-header">
      <div className="container flex items-center justify-between">
        {/* Left: Intelligent Calendar Button */}
        <div className="flex items-center gap-md">
          <Link
            to="/"
            onClick={handleCalendarClick}
            className="flex items-center gap-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105">
              <Calendar size={20} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold hidden sm:block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              BookFlow Pro
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle (Quick Access) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {theme.mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {/* User / Menu Button -> Opens Sidebar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="relative"
          >
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] items-center justify-center text-white font-bold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.name}
                </span>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background-main rounded-full animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User size={24} />
              </div>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
