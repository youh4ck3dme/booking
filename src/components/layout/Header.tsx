import React from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, LogOut, User, Calendar } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="app-header">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Link to="/" className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              BookFlow Pro
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Prepnúť tému"
          >
            {theme.mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <User size={20} />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={20} />
                <span className="hidden sm:inline">Odhlásiť</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">
                Prihlásiť sa
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
