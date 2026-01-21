import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Users, Clock } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';
import { format, subDays, isAfter } from 'date-fns';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-md"
  >
    <div className="flex items-start justify-between mb-sm">
      <div className="p-sm bg-primary/20 rounded-lg">{icon}</div>
      {change && (
        <div className={`text-sm font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </div>
      )}
    </div>
    <div className="text-3xl font-bold mb-xs">{value}</div>
    <div className="text-sm text-secondary">{title}</div>
  </motion.div>
);

export const Analytics: React.FC = () => {
  const { data: bookings = [], isLoading } = useBookings();

  const analytics = useMemo(() => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const last7Days = subDays(now, 7);

    const recentBookings = bookings.filter(b => isAfter(b.createdAt || b.date, last30Days));
    const weekBookings = bookings.filter(b => isAfter(b.createdAt || b.date, last7Days));

    // Total Revenue
    const totalRevenue = bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const monthRevenue = recentBookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    // Popular Services
    const serviceCount = new Map<string, number>();
    bookings.forEach(b => {
      const count = serviceCount.get(b.serviceName) || 0;
      serviceCount.set(b.serviceName, count + 1);
    });

    const topServices = Array.from(serviceCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Status breakdown
    const statusBreakdown = {
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    return {
      totalBookings: bookings.length,
      monthBookings: recentBookings.length,
      weekBookings: weekBookings.length,
      totalRevenue,
      monthRevenue,
      avgBookingValue: totalRevenue / (bookings.length || 1),
      topServices,
      statusBreakdown,
    };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="container py-xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-xl"
      >
        <div className="flex items-center gap-sm mb-sm">
          <TrendingUp className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">Analytika</h1>
        </div>
        <p className="text-secondary">Prehľad výkonnosti a štatistík</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <MetricCard
          title="Celkom rezervácií"
          value={analytics.totalBookings}
          change={`+${analytics.weekBookings} tento týždeň`}
          icon={<Calendar className="text-primary" size={24} />}
          trend="up"
        />
        <MetricCard
          title="Celkový príjem"
          value={`${analytics.totalRevenue.toFixed(2)} €`}
          change={`${analytics.monthRevenue.toFixed(0)} € tento mesiac`}
          icon={<DollarSign className="text-green-400" size={24} />}
          trend="up"
        />
        <MetricCard
          title="Priemerná hodnota"
          value={`${analytics.avgBookingValue.toFixed(2)} €`}
          icon={<TrendingUp className="text-blue-400" size={24} />}
        />
        <MetricCard
          title="Aktívne rezervácie"
          value={analytics.statusBreakdown.confirmed + analytics.statusBreakdown.pending}
          icon={<Users className="text-yellow-400" size={24} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-xl">
        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-lg"
        >
          <h3 className="text-xl font-bold mb-md flex items-center gap-sm">
            <TrendingUp size={20} className="text-primary" />
            Top služby
          </h3>
          <div className="space-y-md">
            {analytics.topServices.map(([service, count], index) => {
              const percentage = (count / analytics.totalBookings) * 100;
              return (
                <div key={service}>
                  <div className="flex justify-between mb-xs">
                    <span className="font-medium">{service}</span>
                    <span className="text-secondary">{count} rezervácií</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-lg"
        >
          <h3 className="text-xl font-bold mb-md flex items-center gap-sm">
            <Clock size={20} className="text-primary" />
            Stav rezervácií
          </h3>
          <div className="space-y-md">
            <div className="flex items-center justify-between p-md bg-green-500/10 rounded-lg border-l-4 border-green-500">
              <span className="font-medium">Potvrdené</span>
              <span className="text-2xl font-bold text-green-400">{analytics.statusBreakdown.confirmed}</span>
            </div>
            <div className="flex items-center justify-between p-md bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
              <span className="font-medium">Čakajúce</span>
              <span className="text-2xl font-bold text-yellow-400">{analytics.statusBreakdown.pending}</span>
            </div>
            <div className="flex items-center justify-between p-md bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
              <span className="font-medium">Dokončené</span>
              <span className="text-2xl font-bold text-blue-400">{analytics.statusBreakdown.completed}</span>
            </div>
            <div className="flex items-center justify-between p-md bg-red-500/10 rounded-lg border-l-4 border-red-500">
              <span className="font-medium">Zrušené</span>
              <span className="text-2xl font-bold text-red-400">{analytics.statusBreakdown.cancelled}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-lg"
      >
        <h3 className="text-xl font-bold mb-md">Nedávna aktivita</h3>
        <div className="space-y-sm">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-sm hover:bg-surface/30 rounded transition-colors">
              <div className="flex items-center gap-md">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-500' :
                  booking.status === 'pending' ? 'bg-yellow-500' :
                  booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium">{booking.customerName}</div>
                  <div className="text-sm text-secondary">{booking.serviceName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{booking.price} €</div>
                <div className="text-xs text-secondary">{format(booking.date, 'd.M.yyyy')}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
