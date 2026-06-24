export interface SmsResult {
  success: boolean;
  logId?: string;
  errorMessage?: string;
}

export interface SmsProvider {
  readonly key: string;
  send(input: {
    phone: string;
    message: string;
    appointmentId?: string;
    userId?: string;
    notificationId?: string;
    meta?: Record<string, unknown>;
  }): Promise<SmsResult>;
}
