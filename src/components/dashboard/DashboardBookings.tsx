import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useBookings } from '../../hooks/useBookings';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { BookingStatus } from '../../types';

const statusColors: Record<BookingStatus, string> = {
    confirmed: 'bg-green-500/20 text-green-500',
    pending: 'bg-yellow-500/20 text-yellow-500',
    cancelled: 'bg-red-500/20 text-red-500',
    completed: 'bg-blue-500/20 text-blue-500',
    'no-show': 'bg-gray-500/20 text-gray-500',
};

const statusLabels: Record<BookingStatus, string> = {
    confirmed: 'Potvrdené',
    pending: 'Čaká na potvrdenie',
    cancelled: 'Zrušené',
    completed: 'Dokončené',
    'no-show': 'Neprišiel',
};

export const DashboardBookings: React.FC = () => {
    const { data: bookings = [], isLoading } = useBookings();

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>Posledné rezervácie</CardTitle></CardHeader>
                <CardContent className="p-md text-center text-secondary">Načítavam...</CardContent>
            </Card>
        );
    }

    const sortedBookings = bookings.slice(0, 5); // Already sorted in hook

    return (
        <Card>
            <CardHeader>
                <CardTitle>Posledné rezervácie</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-secondary bg-white/5 uppercase text-xs">
                            <tr>
                                <th className="px-md py-sm">Zákazník</th>
                                <th className="px-md py-sm">Služba</th>
                                <th className="px-md py-sm">Dátum</th>
                                <th className="px-md py-sm">Stav</th>
                                <th className="px-md py-sm text-right">Cena</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedBookings.map((booking, i) => (
                                <motion.tr
                                    key={booking.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-border last:border-0 hover:bg-white/5"
                                >
                                    <td className="px-md py-sm font-medium">{booking.customerName}</td>
                                    <td className="px-md py-sm">{booking.serviceName}</td>
                                    <td className="px-md py-sm">
                                        {format(new Date(booking.date), 'd. M. yyyy', { locale: sk })}
                                        <span className="text-muted ml-2">{booking.startTime}</span>
                                    </td>
                                    <td className="px-md py-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                                            {statusLabels[booking.status]}
                                        </span>
                                    </td>
                                    <td className="px-md py-sm text-right font-medium">{booking.price}€</td>
                                </motion.tr>
                            ))}
                            {sortedBookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-md py-xl text-center text-muted">Žiadne rezervácie</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardBookings;
