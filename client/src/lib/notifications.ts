export class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }
    return 'denied';
  }

  public canSendNotifications(): boolean {
    return 'Notification' in window && this.permission === 'granted';
  }

  public sendTimerNotification(type: 'focus' | 'break' | 'long_break', duration: number) {
    if (!this.canSendNotifications()) {
      return;
    }

    const title = this.getNotificationTitle(type);
    const body = this.getNotificationBody(type, duration);
    const icon = '/favicon.ico'; // Add your app icon here

    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'focuszen-timer',
      requireInteraction: true,
      actions: [
        {
          action: 'start-break',
          title: type === 'focus' ? 'Start Break' : 'Start Focus',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    });

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Handle notification clicks
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  public sendReminderNotification() {
    if (!this.canSendNotifications()) {
      return;
    }

    const notification = new Notification('FocusZen Reminder', {
      body: "Time to start your focus session! Let's build that streak.",
      icon: '/favicon.ico',
      tag: 'focuszen-reminder',
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 8000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  public sendStreakNotification(streakCount: number) {
    if (!this.canSendNotifications()) {
      return;
    }

    const title = streakCount === 1 ? 'Streak Started!' : `${streakCount} Day Streak!`;
    const body = streakCount === 1 
      ? 'Great job completing your first session today!' 
      : `Amazing! You've maintained your focus for ${streakCount} days in a row.`;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'focuszen-streak',
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 8000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  private getNotificationTitle(type: 'focus' | 'break' | 'long_break'): string {
    switch (type) {
      case 'focus':
        return '🎯 Focus Session Complete!';
      case 'break':
        return '☕ Break Time Over!';
      case 'long_break':
        return '🌟 Long Break Complete!';
      default:
        return '⏰ Timer Complete!';
    }
  }

  private getNotificationBody(type: 'focus' | 'break' | 'long_break', duration: number): string {
    const minutes = Math.floor(duration / 60);
    
    switch (type) {
      case 'focus':
        return `Great job! You focused for ${minutes} minutes. Time for a well-deserved break.`;
      case 'break':
        return `Break time is over. Ready to dive back into focused work?`;
      case 'long_break':
        return `Long break complete! You're refreshed and ready for the next focus session.`;
      default:
        return `Session complete! You spent ${minutes} minutes being productive.`;
    }
  }

  // Schedule daily reminders
  public scheduleDailyReminder(time: string) {
    if (!this.canSendNotifications()) {
      return;
    }

    // This would ideally be handled by a service worker for persistence
    // For now, we'll use a simple timeout approach
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const msUntilReminder = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendReminderNotification();
      // Schedule for the next day
      setTimeout(() => this.scheduleDailyReminder(time), 24 * 60 * 60 * 1000);
    }, msUntilReminder);
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();
