import { SmsStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { SmsProvider, SmsResult } from "./sms.provider.js";

export class SimulatedSmsProvider implements SmsProvider {
  readonly key = "simulated";

  async send(input: {
    phone: string;
    message: string;
    appointmentId?: string;
    userId?: string;
  }): Promise<SmsResult> {
    const log = await prisma.smsLog.create({
      data: {
        phone: input.phone,
        message: input.message,
        appointmentId: input.appointmentId,
        userId: input.userId,
        status: SmsStatus.SENT,
        providerKey: this.key,
      },
    });

    console.log(`[SMS:simulated] To: ${input.phone} | ${input.message}`);

    return { success: true, logId: log.id };
  }
}
