import type { NotificationAdapter, ClassNotificationPayload } from '../notification.types.js';

export class WhatsAppAdapter implements NotificationAdapter {
  async send(payload: ClassNotificationPayload): Promise<void> {
    const message = buildMessage(payload);

    // TODO: integrate with WhatsApp provider (Z-API, Twilio, Evolution API, etc.)
    // Example with Z-API:
    // await fetch(`https://api.z-api.io/instances/{instanceId}/token/{token}/send-text`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone: payload.responsiblePhone, message }),
    // });

    console.log(`[WhatsAppAdapter] Would send WhatsApp to ${payload.responsiblePhone}:\n${message}`);
  }
}

function buildMessage(payload: ClassNotificationPayload): string {
  const lines = [
    `✅ *Aula concluída — ${payload.studentName}*`,
    `📅 ${payload.date} | ${payload.startTime}–${payload.endTime}`,
    ``,
    `*O que foi feito:*`,
    payload.content,
  ];

  if (payload.homework) {
    lines.push(``, `*Tarefa para próxima aula:*`, payload.homework);
  }

  lines.push(``, `📋 Acompanhe o histórico completo: ${payload.portalUrl}`);

  return lines.join('\n');
}
