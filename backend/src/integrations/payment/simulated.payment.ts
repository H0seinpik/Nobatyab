import { PaymentTransactionStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { PaymentProvider, PaymentResult } from "./payment.provider.js";

export class SimulatedPaymentProvider implements PaymentProvider {
  readonly key = "simulated";

  async charge(input: {
    appointmentId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentResult> {
    const externalRef = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const tx = await prisma.paymentTransaction.create({
      data: {
        appointmentId: input.appointmentId,
        amount: input.amount,
        status: PaymentTransactionStatus.SUCCESS,
        providerKey: this.key,
        externalRef,
        rawResponse: {
          simulated: true,
          currency: input.currency ?? "IRR",
          message: "Payment simulated successfully",
        },
      },
    });

    console.log(`[Payment:simulated] Charged ${input.amount} for appointment ${input.appointmentId}`);

    return {
      success: true,
      transactionId: tx.id,
      externalRef,
      rawResponse: tx.rawResponse as Record<string, unknown>,
    };
  }

  async refund(input: { transactionId: string; amount: number }): Promise<PaymentResult> {
    const original = await prisma.paymentTransaction.findUnique({
      where: { id: input.transactionId },
    });

    if (!original) {
      return { success: false, errorMessage: "Transaction not found" };
    }

    const externalRef = `SIM-REF-${Date.now()}`;

    await prisma.paymentTransaction.create({
      data: {
        appointmentId: original.appointmentId,
        amount: -input.amount,
        status: PaymentTransactionStatus.SUCCESS,
        providerKey: this.key,
        externalRef,
        rawResponse: { simulated: true, type: "refund", originalTransactionId: input.transactionId },
      },
    });

    console.log(`[Payment:simulated] Refunded ${input.amount} for tx ${input.transactionId}`);

    return { success: true, externalRef };
  }
}
