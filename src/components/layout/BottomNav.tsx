import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Clock, LayoutDashboard, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const BottomNav: React.FC = () => {
    const { isAuthenticated, user } = useAuthStore();

    const navItems = [
        { to: '/', icon: Home, label: 'Domov' },
        { to: '/book', icon: Calendar, label: 'Rezervovať' },
        { to: '/my-bookings', icon: Clock, label: 'Moje' },
    ];

    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'manager' || user.role === 'employee')) {
        navItems.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
    }

    if (isAuthenticated) {
        navItems.push({ to: '/profile', icon: User, label: 'Profil' });
    }

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `bottom-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
