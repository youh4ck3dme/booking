"use client"

import { useMemo } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfDay } from "date-fns"
import { DroppableDay } from "./DroppableDay"
import { DraggableBookingCard } from "./DraggableBookingCard"
import type { Booking } from "../../../types"

interface BookingCalendarGridProps {
  month: number
  year: number
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
  onDayClick?: (date: Date) => void
  userRole?: string
}

export function BookingCalendarGrid({
  month,
  year,
  bookings,
  onBookingClick,
  onDayClick,
  userRole,
}: BookingCalendarGridProps) {
  const monthDate = useMemo(() => new Date(year, month, 1), [year, month])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }) // Monday start
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })

    return eachDayOfInterval({ start, end })
  }, [monthDate])

  const today = startOfDay(new Date())

  const getBookingsForDay = (dayDate: Date) => {
    return bookings.filter(booking =>
      isSameDay(booking.date, dayDate) &&
      booking.status !== 'cancelled'
    )
  }

  return (
    <div className="border border-white/10 rounded-[32px] overflow-hidden glass shadow-2xl">
      <div className="grid grid-cols-7 bg-muted/30 border-b border-white/10">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="p-3 text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((dayDate) => {
          const isCurrentMonth = isSameMonth(dayDate, monthDate)
          const dayBookings = getBookingsForDay(dayDate)

          return (
            <DroppableDay
              key={dayDate.toISOString()}
              day={dayDate.getDate()}
              date={dayDate}
              isToday={isSameDay(dayDate, today)}
              isOtherMonth={!isCurrentMonth}
              canDrop={userRole === 'admin' || userRole === 'employee'}
              onClick={onDayClick}
            >
              {dayBookings.map((booking) => (
                <DraggableBookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={onBookingClick}
                  canDrag={userRole === 'admin' || userRole === 'employee'}
                />
              ))}
            </DroppableDay>
          )
        })}
      </div>
    </div>
  )
}
