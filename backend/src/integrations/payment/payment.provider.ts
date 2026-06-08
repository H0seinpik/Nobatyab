export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  externalRef?: string;
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

export interface PaymentProvider {
  readonly key: string;
  charge(input: {
    appointmentId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentResult>;
  refund(input: { transactionId: string; amount: number }): Promise<PaymentResult>;
}
