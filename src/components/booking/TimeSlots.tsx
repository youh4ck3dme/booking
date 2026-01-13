import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { TimeSlot } from '../../types';

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
            <div className="grid grid-4 gap-sm">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 skeleton rounded-md" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-center py-lg text-secondary border border-dashed border-border rounded-lg bg-white/5">
                <Clock className="w-8 h-8 mx-auto mb-sm opacity-50" />
                <p>Pre tento deň nie sú voľné žiadne termíny.</p>
            </div>
        );
    }

    // Group slots by part of day (Morning, Afternoon, Evening)
    const groupedSlots = {
        'Ráno': slots.filter(s => new Date(s.startTime).getHours() < 12),
        'Poobedie': slots.filter(s => {
            const h = new Date(s.startTime).getHours();
            return h >= 12 && h < 17;
        }),
        'Večer': slots.filter(s => new Date(s.startTime).getHours() >= 17),
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-md"
        >
            {Object.entries(groupedSlots).map(([label, groupSlots]) => (
                groupSlots.length > 0 && (
                    <div key={label}>
                        <h4 className="text-sm font-medium text-muted mb-sm uppercase tracking-wider">{label}</h4>
                        <div className="grid grid-4 gap-sm">
                            {groupSlots.map((slot) => (
                                <motion.button
                                    key={slot.id}
                                    variants={item}
                                    onClick={() => slot.isAvailable && onSelectSlot(slot.id)}
                                    disabled={!slot.isAvailable}
                                    className={`
                    px-sm py-2 rounded-md text-sm font-medium transition-all
                    ${selectedSlot === slot.id
                                            ? 'bg-primary text-white shadow-md scale-105 ring-2 ring-primary/50'
                                            : slot.isAvailable
                                                ? 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-white/10'
                                                : 'opacity-40 cursor-not-allowed bg-white/5 decoration-slice'
                                        }
                  `}
                                >
                                    {format(slot.startTime, 'HH:mm')}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </motion.div>
    );
};

export default TimeSlots;
