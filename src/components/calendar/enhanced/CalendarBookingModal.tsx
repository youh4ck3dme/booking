"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"
import { BookingForm } from "../../booking/BookingForm"
import { useBookingStore } from "../../../stores/bookingStore"

interface CalendarBookingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
}

export function CalendarBookingModal({ isOpen, onClose, selectedDate }: CalendarBookingModalProps) {
  const { resetForm, setFormData } = useBookingStore()

  // Pre-fill the date when modal opens
  const handleOpen = () => {
    if (selectedDate) {
      setFormData({ date: selectedDate })
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background-paper border border-white/10 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onAnimationComplete={handleOpen}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Rezervovať termín</h2>
                    {selectedDate && (
                      <p className="text-secondary text-sm">
                        {format(selectedDate, "EEEE d. MMMM yyyy", { locale: sk })}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Zavrieť"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <BookingForm />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
