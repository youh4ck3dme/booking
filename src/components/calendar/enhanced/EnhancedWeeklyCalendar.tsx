"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from "date-fns"
import { sk } from "date-fns/locale"
import { DroppableDay } from "./DroppableDay"
import { DraggableBookingCard } from "./DraggableBookingCard"
import type { Booking } from "../../../types"

interface EnhancedWeeklyCalendarProps {
  bookings: Booking[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onBookingClick: (booking: Booking) => void
  onDayClick?: (date: Date) => void
  userRole?: string
}

const timeSlots = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`) // 9 AM - 6 PM

export function EnhancedWeeklyCalendar({
  bookings,
  currentDate,
  onDateChange,
  onBookingClick,
  onDayClick,
  userRole,
}: EnhancedWeeklyCalendarProps) {
  const weekStart = startOfWeek(currentDate, { locale: sk })
  const weekEnd = endOfWeek(currentDate, { locale: sk })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>()
    bookings.forEach((booking) => {
      if (booking.status !== 'cancelled') {
        const dateKey = format(booking.date, 'yyyy-MM-dd')
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(booking)
      }
    })
    return map
  }, [bookings])

  const handlePrevWeek = () => onDateChange(subWeeks(currentDate, 1))
  const handleNextWeek = () => onDateChange(addWeeks(currentDate, 1))
  const handleToday = () => onDateChange(new Date())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CalendarIcon className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold">Týždenný pohľad</h1>
            <p className="text-secondary">
              {format(weekStart, 'd. MMM', { locale: sk })} - {format(weekEnd, 'd. MMM yyyy', { locale: sk })}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors font-medium"
          >
            Dnes
          </button>
          <button
            onClick={handlePrevWeek}
            className="p-2 bg-surface/50 hover:bg-surface/70 rounded-xl transition-colors"
            aria-label="Predchádzajúci týždeň"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 bg-surface/50 hover:bg-surface/70 rounded-xl transition-colors"
            aria-label="Nasledujúci týždeň"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="border border-white/10 rounded-[32px] overflow-hidden glass shadow-2xl">
        <div className="grid grid-cols-8 bg-muted/30 border-b border-white/10">
          {/* Time column header */}
          <div className="p-4 text-center font-bold text-muted-foreground">Čas</div>

          {/* Day headers */}
          {days.map((day) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div
                key={day.toISOString()}
                className={`p-4 text-center border-l border-white/10 ${
                  isToday ? 'bg-primary/10' : ''
                }`}
              >
                <div className="text-sm text-muted-foreground font-medium">
                  {format(day, 'EEE', { locale: sk })}
                </div>
                <div className={`text-2xl font-bold ${
                  isToday ? 'text-primary' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(day, 'MMM', { locale: sk })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time slots */}
        <div className="divide-y divide-white/5">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8">
              {/* Time label */}
              <div className="p-4 bg-surface/20 text-sm font-medium text-muted-foreground flex items-center justify-end pr-6">
                {time}
              </div>

              {/* Day slots */}
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayBookings = bookingsByDay.get(dateKey) || []
                const slotBookings = dayBookings.filter(b =>
                  b.startTime.startsWith(time.split(':')[0])
                )

                return (
                  <DroppableDay
                    key={`${day}-${time}`}
                    day={day.getDate()}
                    date={day}
                    isToday={isSameDay(day, new Date())}
                    isOtherMonth={false}
                    canDrop={userRole === 'admin' || userRole === 'employee'}
                    onClick={onDayClick}
                  >
                    <div className="space-y-2">
                      {slotBookings.map((booking) => (
                        <DraggableBookingCard
                          key={booking.id}
                          booking={booking}
                          onClick={onBookingClick}
                          canDrag={userRole === 'admin' || userRole === 'employee'}
                        />
                      ))}
                    </div>
                  </DroppableDay>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
