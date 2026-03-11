import type { NotificationAdapter, ClassNotificationPayload } from './notification.types.js';
import { EmailAdapter } from './adapters/email.adapter.js';
import { WhatsAppAdapter } from './adapters/whatsapp.adapter.js';

export class NotificationService {
  private adapters: NotificationAdapter[];

  constructor(adapters?: NotificationAdapter[]) {
    this.adapters = adapters ?? [new EmailAdapter(), new WhatsAppAdapter()];
  }

  async sendClassSummary(payload: ClassNotificationPayload): Promise<void> {
    await Promise.allSettled(this.adapters.map((adapter) => adapter.send(payload)));
  }
}
