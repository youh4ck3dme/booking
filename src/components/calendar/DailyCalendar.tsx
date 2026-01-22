import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

import { sk } from 'date-fns/locale';
import type { Booking } from '../../types';

interface DailyCalendarProps {
  bookings: Booking[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
}

const statusColors = {
  confirmed: 'bg-green-500/20 border-l-4 border-green-500',
  pending: 'bg-yellow-500/20 border-l-4 border-yellow-500',
  cancelled: 'bg-red-500/20 border-l-4 border-red-500',
  completed: 'bg-blue-500/20 border-l-4 border-blue-500',
};

// Generate hourly slots from 9 AM to 6 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export const DailyCalendar: React.FC<DailyCalendarProps> = ({ 
  bookings, 
  currentDate, 
  onDateChange,
  onBookingClick 
}) => {
  const dayBookings = useMemo(() => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    return bookings.filter(b => format(b.date, 'yyyy-MM-dd') === dateKey);
  }, [bookings, currentDate]);

  const bookingsByTime = useMemo(() => {
    const map = new Map<string, Booking[]>();
    dayBookings.forEach((booking) => {
      const timeKey = booking.startTime.substring(0, 5); // HH:mm
      if (!map.has(timeKey)) {
        map.set(timeKey, []);
      }
      map.get(timeKey)!.push(booking);
    });
    return map;
  }, [dayBookings]);

  const handlePrevDay = () => onDateChange(subDays(currentDate, 1));
  const handleNextDay = () => onDateChange(addDays(currentDate, 1));
  const handleToday = () => onDateChange(new Date());

  return (
    <div className="glass-card p-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div className="flex items-center gap-sm">
          <CalendarIcon className="text-primary" size={24} />
          <div>
            <h2 className="text-2xl font-bold">
              {format(currentDate, 'EEEE', { locale: sk })}
            </h2>
            <p className="text-secondary">
              {format(currentDate, 'd. MMMM yyyy', { locale: sk })}
            </p>
          </div>
        </div>
        <div className="flex gap-sm">
          <button onClick={handleToday} className="btn btn-secondary btn-sm">
            Dnes
          </button>
          <button onClick={handlePrevDay} className="btn btn-outline btn-sm" aria-label="Predchádzajúci deň">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNextDay} className="btn btn-outline btn-sm" aria-label="Nasledujúci deň">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-md mb-lg">
        <div className="glass-card p-sm text-center">
          <div className="text-2xl font-bold text-primary">{dayBookings.length}</div>
          <div className="text-xs text-secondary">Celkom rezervácií</div>
        </div>
        <div className="glass-card p-sm text-center">
          <div className="text-2xl font-bold text-green-400">
            {dayBookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-xs text-secondary">Potvrdené</div>
        </div>
        <div className="glass-card p-sm text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {dayBookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-xs text-secondary">Čakajúce</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-xs">
        {timeSlots.map((time) => {
          const slotBookings = bookingsByTime.get(time) || [];
          const hasBookings = slotBookings.length > 0;

          return (
            <div key={time} className="flex gap-md">
              <div className="w-20 text-sm text-secondary text-right pt-sm">{time}</div>
              <div className="flex-1 min-h-[60px] border-l-2 border-border pl-md">
                {hasBookings ? (
                  <div className="space-y-xs">
                    {slotBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-md rounded cursor-pointer ${
                          statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-500/20'
                        }`}
                        onClick={() => onBookingClick?.(booking)}
                      >
                        <div className="flex justify-between items-start mb-xs">
                          <div>
                            <div className="font-bold">{booking.customerName}</div>
                            <div className="text-sm text-secondary">{booking.customerEmail}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {booking.startTime} - {booking.endTime}
                            </div>
                            <div className="text-xs text-secondary">{booking.duration} min</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">{booking.serviceName}</div>
                          <div className="text-sm font-semibold">{booking.price} €</div>
                        </div>
                        {booking.notes && (
                          <div className="text-xs text-secondary mt-xs border-t border-border/30 pt-xs">
                            {booking.notes}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center text-sm text-secondary/50">
                    Voľné
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {dayBookings.length === 0 && (
        <div className="text-center py-xl">
          <CalendarIcon className="mx-auto mb-md text-secondary/50" size={48} />
          <p className="text-secondary">Žiadne rezervácie na tento deň</p>
        </div>
      )}
    </div>
  );
};
