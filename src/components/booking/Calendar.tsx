import React from 'react';
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
    startOfDay
} from 'date-fns';
import { sk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
    selectedDate,
    onDateSelect,
    minDate = new Date()
}) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const days = React.useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { locale: sk });
        const end = endOfWeek(endOfMonth(currentMonth), { locale: sk });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const weekDays = ['Po', 'Ut', 'Str', 'Št', 'Pia', 'So', 'Ne'];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const isDateDisabled = (date: Date) => {
        return isBefore(date, startOfDay(minDate));
    };

    return (
        <div className="w-full max-w-sm mx-auto p-md glass-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-md">
                <Button variant="ghost" size="sm" onClick={prevMonth} disabled={isBefore(currentMonth, startOfMonth(minDate))}>
                    <ChevronLeft size={20} />
                </Button>
                <span className="font-bold text-lg capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: sk })}
                </span>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                    <ChevronRight size={20} />
                </Button>
            </div>

            {/* Week days */}
            <div className="grid grid-7 mb-xs">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm text-secondary font-medium py-xs">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-7 gap-1">
                <AnimatePresence mode="popLayout" initial={false}>
                    {days.map((day) => {
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                        const isDisabled = isDateDisabled(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isCurrentDay = isToday(day);

                        return (
                            <motion.button
                                key={day.toString()}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => !isDisabled && onDateSelect(day)}
                                disabled={isDisabled}
                                className={`
                  aspect-square rounded-full flex items-center justify-center text-sm relative
                  transition-colors duration-200
                  ${!isCurrentMonth && 'text-muted'}
                  ${isDisabled && 'opacity-30 cursor-not-allowed'}
                  ${isSelected ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/10'}
                  ${!isSelected && !isDisabled && isCurrentMonth && 'text-primary-foreground'}
                `}
                            >
                                {format(day, 'd')}
                                {isCurrentDay && !isSelected && (
                                    <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Calendar;
