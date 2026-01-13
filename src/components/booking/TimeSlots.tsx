import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import type { TimeSlot } from "../../types";

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  isLoading?: boolean;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-white/5 animate-pulse rounded-xl border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-secondary border border-dashed border-white/10 rounded-2xl bg-white/5">
        <Clock className="w-10 h-10 mx-auto mb-3 text-primary opacity-50" />
        <p className="font-medium">Všetky termíny sú obsadené</p>
        <p className="text-sm text-muted">Skúste iný deň</p>
      </div>
    );
  }

  // Group slots by part of day
  const groupedSlots = {
    "Ráno (08:00 - 12:00)": slots.filter(
      (s) => new Date(s.startTime).getHours() < 12
    ),
    "Poobedie (12:00 - 17:00)": slots.filter((s) => {
      const h = new Date(s.startTime).getHours();
      return h >= 12 && h < 17;
    }),
    "Večer (17:00+)": slots.filter(
      (s) => new Date(s.startTime).getHours() >= 17
    ),
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar"
    >
      {Object.entries(groupedSlots).map(
        ([label, groupSlots]) =>
          groupSlots.length > 0 && (
            <div key={label} className="relative">
              <div className="sticky top-0 bg-background/80 backdrop-blur-md py-2 z-10 mb-2 border-b border-white/5">
                <h4 className="text-xs font-bold text-primary-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary var-glow" />
                  {label}
                </h4>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupSlots.map((slot) => (
                  <motion.button
                    key={slot.id}
                    variants={item}
                    onClick={() => slot.isAvailable && onSelectSlot(slot.id)}
                    disabled={!slot.isAvailable}
                    whileHover={slot.isAvailable ? { scale: 1.05, y: -2 } : {}}
                    whileTap={slot.isAvailable ? { scale: 0.95 } : {}}
                    className={`
                                        relative overflow-hidden
                                        px-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 border
                                        ${
                                          selectedSlot === slot.id
                                            ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] border-transparent ring-2 ring-primary-light ring-offset-2 ring-offset-background"
                                            : slot.isAvailable
                                            ? "bg-white/5 text-secondary border-white/10 hover:bg-white/10 hover:border-primary/30 hover:text-white hover:shadow-lg"
                                            : "opacity-30 cursor-not-allowed bg-black/20 border-transparent text-muted decoration-slice"
                                        }
                                    `}
                  >
                    <span className="relative z-10 font-mono tracking-wide text-base">
                      {format(slot.startTime, "HH:mm")}
                    </span>

                    {selectedSlot === slot.id && (
                      <motion.div
                        layoutId="slot-glow"
                        className="absolute inset-0 bg-white/20 blur-lg -z-0"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )
      )}
    </motion.div>
  );
};

export default TimeSlots;
