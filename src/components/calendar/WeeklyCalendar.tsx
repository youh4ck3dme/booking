import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { sk } from 'date-fns/locale';
import type { Booking } from '../../types';

interface WeeklyCalendarProps {
  bookings: Booking[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
  onBookingUpdate?: (bookingId: string, newDate: Date, newTime: string) => Promise<void>;
}

const statusColors = {
  confirmed: 'bg-green-500/20 border-l-4 border-green-500',
  pending: 'bg-yellow-500/20 border-l-4 border-yellow-500',
  cancelled: 'bg-red-500/20 border-l-4 border-red-500',
  completed: 'bg-blue-500/20 border-l-4 border-blue-500',
};

const timeSlots = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`); // 9 AM - 6 PM

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  bookings, 
  currentDate, 
  onDateChange,
  onBookingClick,
  onBookingUpdate
}) => {
  const weekStart = startOfWeek(currentDate, { locale: sk });
  const weekEnd = endOfWeek(currentDate, { locale: sk });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const bookingsByDay = useMemo(() => {
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

  const handlePrevWeek = () => onDateChange(subWeeks(currentDate, 1));
  const handleNextWeek = () => onDateChange(addWeeks(currentDate, 1));
  const handleToday = () => onDateChange(new Date());

  return (
    <div className="glass-card p-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-2xl font-bold">
          {format(weekStart, 'd. MMM', { locale: sk })} - {format(weekEnd, 'd. MMM yyyy', { locale: sk })}
        </h2>
        <div className="flex gap-sm">
          <button onClick={handleToday} className="btn btn-secondary btn-sm">
            Dnes
          </button>
          <button onClick={handlePrevWeek} className="btn btn-outline btn-sm" aria-label="Predchádzajúci týždeň">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNextWeek} className="btn btn-outline btn-sm" aria-label="Nasledujúci týždeň">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
        {/* Time column header */}
        <div className="bg-surface/50 p-sm text-center font-semibold text-sm">Čas</div>
        
        {/* Day headers */}
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`bg-surface/50 p-sm text-center ${isToday ? 'bg-primary/20' : ''}`}
            >
              <div className="text-xs text-secondary">{format(day, 'EEE', { locale: sk })}</div>
              <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}

        {/* Time slots */}
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="bg-surface/30 p-sm text-sm text-secondary text-right">{time}</div>
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayBookings = bookingsByDay.get(dateKey) || [];
              const slotBookings = dayBookings.filter(b => b.startTime.startsWith(time.split(':')[0]));

              return (
                <div key={`${day}-${time}`} className="bg-surface/20 p-xs min-h-[60px] relative">
                  {slotBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      drag={!!onBookingUpdate}
                      dragSnapToOrigin
                      dragElastic={0.2}
                      dragMomentum={false}
                      whileHover={{ scale: 1.02, cursor: onBookingUpdate ? 'grab' : 'pointer' }}
                      whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 50, opacity: 0.8 }}
                      onDragEnd={(_, info) => {
                         if (!onBookingUpdate) return;
                         
                         // Simple grid math: 
                         // Each day col is approx width/8 (1 time + 7 days)
                         // Each hour slot is approx height
                         // For now, we only support dragging to different TIMES within the same week view
                         // Calculating exactly where it dropped relative to grid requires refs or elementFromPoint
                         // Using simple heuristic:
                         // x > 0 -> moved right (next days), x < 0 -> moved left (prev days)
                         // y > 0 -> moved down (later time), y < 0 -> moved up (earlier time)
                         
                         // Approx cell dimensions (hardcoded for now, ideal would be measuring)
                         const CELL_WIDTH = 120; // approximate
                         const CELL_HEIGHT = 60; // min-h-[60px]

                         const dayDelta = Math.round(info.offset.x / CELL_WIDTH);
                         const timeDelta = Math.round(info.offset.y / CELL_HEIGHT);

                         if (dayDelta === 0 && timeDelta === 0) return;

                         // Calculate new date
                         // Current date of the booking
                         const currentBookingDate = booking.date;
                         const newDate = new Date(currentBookingDate);
                         newDate.setDate(newDate.getDate() + dayDelta);

                         // Calculate new time
                         const [hours, minutes] = booking.startTime.split(':').map(Number);
                         const newHours = hours + timeDelta;
                         
                         // Validate bounds
                         if (newHours < 9 || newHours > 18) return; // Out of business hours

                         const newTime = `${newHours}:${minutes.toString().padStart(2, '0')}`;
                         
                         // Call update
                         onBookingUpdate(booking.id, newDate, newTime);
                      }}
                      className={`text-xs p-xs rounded mb-xs shadow-sm ${
                        statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-500/20'
                      }`}
                      onClick={() => onBookingClick?.(booking)}
                    >
                      <div className="font-semibold truncate">{booking.customerName}</div>
                      <div className="text-secondary truncate">{booking.serviceName}</div>
                      <div className="text-xs">{booking.startTime}</div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
