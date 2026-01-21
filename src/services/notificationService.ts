/**
 * Notification Service
 * Handles browser push notifications for booking reminders
 */

export type NotificationType = 'booking_created' | 'booking_reminder' | 'booking_cancelled' | 'booking_confirmed';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
}

class NotificationService {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission was previously denied');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Show a notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // If service worker is available, use it for better reliability
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-192.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: false,
      });
    } else {
      // Fallback to basic notification
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
      });
    }
  }

  /**
   * Schedule a booking reminder (24h before)
   */
  scheduleBookingReminder(bookingId: string, bookingDate: Date, serviceName: string): void {
    const now = new Date();
    const reminderTime = new Date(bookingDate);
    reminderTime.setHours(reminderTime.getHours() - 24); // 24h before

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder > 0 && timeUntilReminder < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
      setTimeout(() => {
        this.showNotification({
          title: '📅 Pripomienka rezervácie',
          body: `Zajtra máte rezerváciu: ${serviceName}`,
          tag: `booking-reminder-${bookingId}`,
          data: { bookingId, type: 'reminder' },
        });
      }, timeUntilReminder);
    }
  }

  /**
   * Send booking confirmation notification
   */
  async notifyBookingCreated(serviceName: string, date: string, time: string): Promise<void> {
    await this.showNotification({
      title: '✅ Rezervácia vytvorená',
      body: `${serviceName} - ${date} o ${time}`,
      tag: 'booking-created',
    });
  }

  /**
   * Send booking cancellation notification
   */
  async notifyBookingCancelled(serviceName: string): Promise<void> {
    await this.showNotification({
      title: '❌ Rezervácia zrušená',
      body: `Vaša rezervácia "${serviceName}" bola zrušená`,
      tag: 'booking-cancelled',
    });
  }

  /**
   * Send booking confirmation notification (admin approved)
   */
  async notifyBookingConfirmed(serviceName: string, date: string, time: string): Promise<void> {
    await this.showNotification({
      title: '✅ Rezervácia potvrdená',
      body: `${serviceName} - ${date} o ${time}`,
      tag: 'booking-confirmed',
    });
  }
}

export const notificationService = new NotificationService();
