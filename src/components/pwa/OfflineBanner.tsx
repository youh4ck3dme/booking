import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-500/90 text-white text-center text-sm font-medium overflow-hidden backdrop-blur-md z-[600] fixed top-0 left-0 right-0"
                >
                    <div className="p-sm flex items-center justify-center gap-sm">
                        <WifiOff size={16} />
                        <span>Ste offline. Niektoré funkcie nemusia byť dostupné.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
