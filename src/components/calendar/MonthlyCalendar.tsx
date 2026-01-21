import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { sk } from 'date-fns/locale';
import type { Booking } from '../../types';

interface CalendarProps {
  bookings: Booking[];
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
}

const statusColors = {
  confirmed: 'bg-green-500/20 border-green-500/50 text-green-400',
  pending: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  cancelled: 'bg-red-500/20 border-red-500/50 text-red-400',
  completed: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
};

export const MonthlyCalendar: React.FC<CalendarProps> = ({ bookings, onDateClick, onBookingClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: sk });
  const calendarEnd = endOfWeek(monthEnd, { locale: sk });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const dateKey = format(booking.date, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(booking);
    });
    return map;
  }, [bookings]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  return (
    <div className="glass-card p-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div className="flex items-center gap-sm">
          <CalendarIcon className="text-primary" size={24} />
          <h2 className="text-2xl font-bold">
            {format(currentMonth, 'LLLL yyyy', { locale: sk })}
          </h2>
        </div>
        <div className="flex gap-sm">
          <button
            onClick={handleToday}
            className="btn btn-secondary btn-sm"
          >
            Dnes
          </button>
          <button
            onClick={handlePrevMonth}
            className="btn btn-outline btn-sm"
            aria-label="Predchádzajúci mesiac"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="btn btn-outline btn-sm"
            aria-label="Nasledujúci mesiac"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-xs mb-xs">
        {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-secondary p-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-xs">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <motion.div
              key={day.toISOString()}
              whileHover={{ scale: 1.02 }}
              className={`
                min-h-[100px] p-xs rounded-lg border cursor-pointer
                ${isCurrentMonth ? 'bg-surface/50' : 'bg-surface/20 opacity-50'}
                ${isToday ? 'border-primary ring-2 ring-primary/30' : 'border-border'}
                hover:border-primary/50 transition-all
              `}
              onClick={() => onDateClick?.(day)}
            >
              <div className={`text-sm font-semibold mb-xs ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-xs">
                {dayBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className={`text-xs p-xs rounded border ${statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-500/20 border-gray-500/50 text-gray-400'} truncate`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick?.(booking);
                    }}
                  >
                    {booking.startTime} {booking.customerName}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-secondary text-center">
                    +{dayBookings.length - 3} ďalších
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-md mt-lg pt-md border-t border-border">
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded bg-green-500/50"></div>
          <span className="text-sm text-secondary">Potvrdené</span>
        </div>
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded bg-yellow-500/50"></div>
          <span className="text-sm text-secondary">Čakajúce</span>
        </div>
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded bg-red-500/50"></div>
          <span className="text-sm text-secondary">Zrušené</span>
        </div>
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded bg-blue-500/50"></div>
          <span className="text-sm text-secondary">Dokončené</span>
        </div>
      </div>
    </div>
  );
};
