import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/Button';

export const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );
  const [preferences, setPreferences] = useState({
    bookingReminders: localStorage.getItem('notify-reminders') !== 'false',
    bookingConfirmations: localStorage.getItem('notify-confirmations') !== 'false',
    bookingCancellations: localStorage.getItem('notify-cancellations') !== 'false',
  });

  const handleEnableNotifications = async () => {
    try {
      const result = await notificationService.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await notificationService.showNotification({
          title: '🔔 Notifikácie zapnuté',
          body: 'Budete dostávať pripomienky o vašich rezerváciách',
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  const handleTestNotification = async () => {
    await notificationService.showNotification({
      title: '🧪 Testovacia notifikácia',
      body: 'Toto je ukážka notifikácie z BookFlow',
    });
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`notify-${key.replace('booking', '').toLowerCase()}`, value.toString());
  };

  const isSupported = notificationService.isNotificationSupported();

  if (!isSupported) {
    return (
      <div className="glass-card p-md">
        <div className="flex items-center gap-sm text-secondary">
          <BellOff size={20} />
          <p>Váš prehliadač nepodporuje notifikácie</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {/* Permission Status */}
      <div className="glass-card p-md">
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <Bell className={permission === 'granted' ? 'text-green-400' : 'text-secondary'} size={24} />
            <div>
              <h3 className="font-bold">Push Notifikácie</h3>
              <p className="text-sm text-secondary">
                {permission === 'granted' && 'Notifikácie sú zapnuté'}
                {permission === 'denied' && 'Notifikácie sú blokované'}
                {permission === 'default' && 'Notifikácie nie sú povolené'}
              </p>
            </div>
          </div>
          
          {permission === 'default' && (
            <Button onClick={handleEnableNotifications} size="sm">
              Zapnúť
            </Button>
          )}
          
          {permission === 'granted' && (
            <Button onClick={handleTestNotification} variant="outline" size="sm">
              Test
            </Button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-sm text-sm">
            <p className="text-red-400">
              Notifikácie boli blokované. Povoľte ich v nastaveniach prehliadača.
            </p>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      {permission === 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-md"
        >
          <h3 className="font-bold mb-md">Typy notifikácií</h3>
          
          <div className="space-y-sm">
            <PreferenceToggle
              label="Pripomienky rezervácií"
              description="24h pred termínom"
              checked={preferences.bookingReminders}
              onChange={(checked) => handlePreferenceChange('bookingReminders', checked)}
            />
            
            <PreferenceToggle
              label="Potvrdenia rezervácií"
              description="Keď admin potvrdí rezerváciu"
              checked={preferences.bookingConfirmations}
              onChange={(checked) => handlePreferenceChange('bookingConfirmations', checked)}
            />
            
            <PreferenceToggle
              label="Zrušenia rezervácií"
              description="Keď je rezervácia zrušená"
              checked={preferences.bookingCancellations}
              onChange={(checked) => handlePreferenceChange('bookingCancellations', checked)}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-sm rounded hover:bg-surface/30 transition-colors">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-secondary">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${checked ? 'bg-primary' : 'bg-surface'}
        `}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
          animate={{ left: checked ? '28px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};
