"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "../../../lib/utils"

interface DroppableDayProps {
  day: number
  date: Date
  isToday: boolean
  isOtherMonth?: boolean
  canDrop?: boolean
  onClick?: (date: Date) => void
  children?: React.ReactNode
}

export function DroppableDay({ day, date, isToday, isOtherMonth, canDrop = false, onClick, children }: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date.toISOString()}`,
    data: { date },
    disabled: !canDrop,
  })

  const handleClick = () => {
    if (onClick && !isOtherMonth) {
      onClick(date)
    }
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={cn(
        "min-h-[120px] p-2 border-r border-b transition-colors duration-200 relative cursor-pointer",
        isOver && canDrop && "bg-primary/10 ring-2 ring-primary ring-inset",
        isOtherMonth ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed" : "bg-card/20 hover:bg-card/30",
        isToday && !isOtherMonth && "bg-primary/5",
        onClick && !isOtherMonth && "hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={cn(
          "text-xs font-bold px-1.5 py-0.5 rounded-md",
          isToday && !isOtherMonth ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}>
          {day}
        </span>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}
