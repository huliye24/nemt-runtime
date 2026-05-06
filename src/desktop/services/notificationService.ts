import { Notification } from 'electron';

export interface NotificationRequest {
  title: string;
  body: string;
  urgency?: 'low' | 'normal' | 'critical';
  iconPath?: string;
  sound?: boolean;
  onClickAction?: string;
  tag?: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  urgency: string;
  createdAt: number;
  wasClicked: boolean;
}

export class NotificationService {
  private readonly history: NotificationRecord[] = [];
  private readonly maxHistory = 200;
  private enabled = true;

  notify(request: NotificationRequest): NotificationRecord | null {
    if (!this.enabled) return null;

    const record: NotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: request.title,
      body: request.body,
      urgency: request.urgency ?? 'normal',
      createdAt: Date.now(),
      wasClicked: false,
    };

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: request.title,
        body: request.body,
        urgency: request.urgency ?? 'normal',
        icon: request.iconPath,
        silent: !(request.sound ?? true),
      });

      notification.on('click', () => {
        record.wasClicked = true;
      });

      notification.show();
    }

    this.history.unshift(record);
    if (this.history.length > this.maxHistory) {
      this.history.length = this.maxHistory;
    }

    return record;
  }

  getHistory(limit = 50): NotificationRecord[] {
    return this.history.slice(0, limit);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  clearHistory(): void {
    this.history.length = 0;
  }
}
