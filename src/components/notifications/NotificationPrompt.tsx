import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/Button';

export const NotificationPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [permission] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );

  useEffect(() => {

    // Show prompt if permission is default and user hasn't dismissed it recently
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    if (permission === 'default' && daysSinceDismissed > 7) {
      // Show after 3 seconds
      setTimeout(() => setShow(true), 3000);
    }
  }, [permission]);

  const handleEnable = async () => {
    try {
      const result = await notificationService.requestPermission();
      
      if (result === 'granted') {
        // Show test notification
        await notificationService.showNotification({
          title: '🔔 Notifikácie zapnuté',
          body: 'Budete dostávať pripomienky o vašich rezerváciách',
        });
      }
      
      setShow(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    setShow(false);
  };

  if (!notificationService.isNotificationSupported() || permission !== 'default') {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 md:bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="glass-card p-md shadow-2xl border-2 border-primary/30">
            <div className="flex items-start gap-sm mb-sm">
              <Bell className="text-primary flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-xs">Zapnúť notifikácie?</h3>
                <p className="text-sm text-secondary">
                  Dostávajte pripomienky o vašich rezerváciách 24 hodín vopred
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-secondary hover:text-primary transition-colors"
                aria-label="Zavrieť"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex gap-sm mt-md">
              <Button
                onClick={handleEnable}
                className="flex-1"
                leftIcon={<Check size={18} />}
              >
                Zapnúť
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Neskôr
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
