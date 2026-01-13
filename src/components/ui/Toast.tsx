import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
};

export const ToastContainer: React.FC = () => {
    const { notifications, removeNotification } = useUIStore();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {notifications.map((notification) => {
                    const Icon = iconMap[notification.type];

                    return (
                        <motion.div
                            key={notification.id}
                            className={`toast ${colorMap[notification.type]}`}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            layout
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-sm">{notification.title}</p>
                                <p className="text-sm text-secondary">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="btn-ghost p-xs rounded-full"
                                aria-label="Zavrieť"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};



export default ToastContainer;
