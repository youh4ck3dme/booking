import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { sk } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "../ui/Button";

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [direction, setDirection] = React.useState(0);

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: sk });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: sk });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ["Po", "Ut", "Str", "Št", "Pia", "So", "Ne"];

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(minDate));
  };

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.4,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    }),
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Glass Container */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl p-6">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            disabled={isBefore(currentMonth, startOfMonth(minDate))}
            className="hover:bg-white/10 text-white rounded-xl w-10 h-10 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft size={22} />
          </Button>

          <motion.div
            key={currentMonth.toISOString()}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="font-display font-bold text-xl capitalize text-white tracking-wide">
              {format(currentMonth, "LLLL", { locale: sk })}
            </span>
            <span className="text-sm font-medium text-primary-300 font-display">
              {format(currentMonth, "yyyy", { locale: sk })}
            </span>
          </motion.div>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="hover:bg-white/10 text-white rounded-xl w-10 h-10 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <ChevronRight size={22} />
          </Button>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 mb-4 relative z-10">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-secondary uppercase tracking-widest py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid container for transitions */}
        <div className="relative z-10 overflow-hidden min-h-[280px]">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={currentMonth.toISOString()}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-7 gap-2 absolute w-full"
            >
              {days.map((day, i) => {
                const isSelected = selectedDate
                  ? isSameDay(day, selectedDate)
                  : false;
                const isDisabled = isDateDisabled(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { delay: i * 0.01 },
                    }}
                    onClick={() => !isDisabled && onDateSelect(day)}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1.15, zIndex: 10 } : {}}
                    whileTap={!isDisabled ? { scale: 0.9 } : {}}
                    className={`
                                            relative aspect-square rounded-xl flex flex-col items-center justify-center
                                            transition-all duration-300 border
                                            ${
                                              isSelected
                                                ? "bg-gradient-to-br from-primary to-purple-600 border-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)] z-10 text-white"
                                                : isCurrentMonth
                                                ? "bg-white/5 border-white/5 hover:bg-white/10 text-white"
                                                : "text-muted border-transparent opacity-30"
                                            }
                                            ${
                                              isDisabled &&
                                              "opacity-20 cursor-not-allowed hover:bg-transparent hover:scale-100"
                                            }
                                        `}
                  >
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? "text-white" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {isCurrentDay && !isSelected && (
                      <span className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_currentColor]" />
                    )}
                    {isSelected && (
                      <motion.div
                        layoutId="selected-day-glow"
                        className="absolute inset-0 rounded-xl bg-white/20 blur-md -z-10"
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
