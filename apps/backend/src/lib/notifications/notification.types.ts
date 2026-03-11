export interface ClassNotificationPayload {
  studentName: string;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string | null;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  homework: string | null;
  portalUrl: string;
}

export interface NotificationAdapter {
  send(payload: ClassNotificationPayload): Promise<void>;
}
