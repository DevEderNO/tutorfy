import type { NotificationAdapter, ClassNotificationPayload } from '../notification.types.js';

export class EmailAdapter implements NotificationAdapter {
  async send(payload: ClassNotificationPayload): Promise<void> {
    if (!payload.responsibleEmail) return;

    // TODO: integrate with email provider (Resend, Nodemailer, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Tutorfy <noreply@tutorfy.com>',
    //   to: payload.responsibleEmail,
    //   subject: `Resumo da aula de ${payload.studentName} - ${payload.date}`,
    //   html: buildEmailHtml(payload),
    // });

    console.log(`[EmailAdapter] Would send email to ${payload.responsibleEmail} for student ${payload.studentName}`);
  }
}
