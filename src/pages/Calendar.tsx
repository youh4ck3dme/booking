import React, { useState } from 'react';
import { MonthlyCalendar } from '../components/calendar/MonthlyCalendar';
import { useBookings } from '../hooks/useBookings';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import type { Booking } from '../types';

type ViewMode = 'month' | 'week' | 'day';

export const Calendar: React.FC = () => {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useBookings(user?.role === 'admin' ? undefined : user?.id);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // TODO: Open booking creation modal for this date
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    // TODO: Open booking details modal
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div className="flex items-center gap-sm">
            <CalendarIcon className="text-primary" size={32} />
            <div>
              <h1 className="text-3xl font-bold">Kalendár</h1>
              <p className="text-secondary">
                {user?.role === 'admin' ? 'Všetky rezervácie' : 'Moje rezervácie'}
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex gap-xs bg-surface/50 p-xs rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`
                px-md py-sm rounded flex items-center gap-xs transition-all
                ${viewMode === 'month' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}
              `}
            >
              <Grid size={18} />
              <span className="hidden sm:inline">Mesiac</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`
                px-md py-sm rounded flex items-center gap-xs transition-all
                ${viewMode === 'week' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}
              `}
              disabled
            >
              <List size={18} />
              <span className="hidden sm:inline">Týždeň</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`
                px-md py-sm rounded flex items-center gap-xs transition-all
                ${viewMode === 'day' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}
              `}
              disabled
            >
              <CalendarIcon size={18} />
              <span className="hidden sm:inline">Deň</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Calendar View */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {viewMode === 'month' && (
          <MonthlyCalendar
            bookings={bookings}
            onDateClick={handleDateClick}
            onBookingClick={handleBookingClick}
          />
        )}
        {viewMode === 'week' && (
          <div className="glass-card p-xl text-center">
            <p className="text-secondary">Týždenný pohľad bude dostupný v budúcej verzii</p>
          </div>
        )}
        {viewMode === 'day' && (
          <div className="glass-card p-xl text-center">
            <p className="text-secondary">Denný pohľad bude dostupný v budúcej verzii</p>
          </div>
        )}
      </motion.div>

      {/* Booking Details Modal - TODO */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-xl max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-md">Detail rezervácie</h3>
            <div className="space-y-sm">
              <p><strong>Zákazník:</strong> {selectedBooking.customerName}</p>
              <p><strong>Služba:</strong> {selectedBooking.serviceName}</p>
              <p><strong>Čas:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
              <p><strong>Stav:</strong> {selectedBooking.status}</p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="btn btn-primary w-full mt-lg"
            >
              Zavrieť
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
