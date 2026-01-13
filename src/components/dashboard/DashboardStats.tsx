import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookings } from '../../hooks/useBookings';
import { isToday } from 'date-fns';

interface StatProps {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ElementType;
    color: string;
    delay: number;
    testId?: string;
}

const StatCard: React.FC<StatProps> = ({ label, value, trend, trendUp, icon: Icon, color, delay, testId }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Card>
            <CardContent className="p-md flex items-center justify-between">
                <div>
                    <p className="text-secondary text-sm mb-xs font-medium">{label}</p>
                    <h3 className="text-2xl font-bold mb-xs" data-testid={testId}>{value}</h3>
                    <p className={`text-xs flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={12} className={trendUp ? '' : 'rotate-180'} />
                        {trend}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${color}`}>
                    <Icon size={24} />
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export const DashboardStats: React.FC = () => {
    const { data: bookings = [], isLoading } = useBookings();

    if (isLoading) {
        return (
            <div className="grid grid-2 lg:grid-4 gap-md mb-xl">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 skeleton rounded-lg" />
                ))}
            </div>
        );
    }

    // Group calculations
    const todayBookingsList = bookings.filter(b => isToday(new Date(b.date)) && b.status !== 'cancelled');

    // Unique customers by email
    const uniqueCustomers = new Set(bookings.map(b => b.customerEmail)).size;

    // Revenue (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRevenue = bookings
        .filter(b => new Date(b.date) >= weekAgo && b.status === 'confirmed')
        .reduce((sum, b) => sum + b.price, 0);

    // Occupancy (simple calculation: bookings / total capacity per day)
    const occupancy = Math.min(100, Math.round((bookings.length / 50) * 100));

    const stats = [
        {
            label: 'Dnešné rezervácie',
            value: todayBookingsList.length.toString(),
            trend: '+20% vs včera',
            trendUp: true,
            icon: Calendar,
            color: 'from-blue-500 to-blue-600',
            testId: 'stat-today-bookings'
        },
        {
            label: 'Celkoví zákazníci',
            value: uniqueCustomers.toString(),
            trend: '+12% tento mesiac',
            trendUp: true,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            testId: 'stat-total-customers'
        },
        {
            label: 'Tržba (Týždeň)',
            value: `${weeklyRevenue}€`,
            trend: '+5% vs minulý týždeň',
            trendUp: true,
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
            testId: 'stat-weekly-revenue'
        },
        {
            label: 'Odhad vyťaženosti',
            value: `${occupancy}%`,
            trend: '-2% vs včera',
            trendUp: false,
            icon: TrendingUp,
            color: 'from-orange-500 to-orange-600',
            testId: 'stat-occupancy'
        },
    ];

    return (
        <div className="grid grid-2 lg:grid-4 gap-md mb-xl">
            {stats.map((stat, i) => (
                <StatCard key={i} {...stat} delay={i * 0.1} />
            ))}
        </div>
    );
};

export default DashboardStats;
