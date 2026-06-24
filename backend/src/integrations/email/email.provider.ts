export interface EmailResult {
  success: boolean;
  logId?: string;
  errorMessage?: string;
}

export interface EmailProvider {
  readonly key: string;
  send(input: {
    email: string;
    subject: string;
    body: string;
    userId?: string;
    notificationId?: string;
  }): Promise<EmailResult>;
}
