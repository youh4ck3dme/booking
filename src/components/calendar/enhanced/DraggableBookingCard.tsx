"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { User, Clock, Scissors } from "lucide-react"
import { cn } from "../../../lib/utils"
import type { Booking } from "../../../types"

interface DraggableBookingCardProps {
  booking: Booking
  onClick: (booking: Booking) => void
  canDrag?: boolean
}

export function DraggableBookingCard({ booking, onClick, canDrag = false }: DraggableBookingCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.4 : undefined,
    touchAction: "none",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="h-full">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(booking)}
        className={cn(
          "group relative flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden",
          getStatusColor(booking.status),
          canDrag && "hover:shadow-primary/5"
        )}
      >
        <div className="p-3 flex flex-col h-full space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider", {
                  'bg-green-500/20 text-green-300': booking.status === 'confirmed',
                  'bg-yellow-500/20 text-yellow-300': booking.status === 'pending',
                  'bg-red-500/20 text-red-300': booking.status === 'cancelled',
                })}>
                  {booking.status}
                </div>
              </div>
              <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {booking.serviceName}
              </h4>
            </div>
          </div>

          <div className="space-y-1 mt-auto">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
              <User className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{booking.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3 text-primary/60 shrink-0" />
              <span>{booking.startTime}</span>
            </div>
          </div>
        </div>

        {canDrag && (
          <div className="absolute top-2 right-2 h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-sm">
            <Scissors className="h-3 w-3" />
          </div>
        )}
      </motion.div>
    </div>
  )
}
