import { EmailStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { EmailProvider, EmailResult } from "./email.provider.js";

export class SimulatedEmailProvider implements EmailProvider {
  readonly key = "simulated";

  async send(input: {
    email: string;
    subject: string;
    body: string;
    userId?: string;
    notificationId?: string;
  }): Promise<EmailResult> {
    const log = await prisma.emailLog.create({
      data: {
        email: input.email,
        subject: input.subject,
        body: input.body,
        userId: input.userId,
        notificationId: input.notificationId,
        status: EmailStatus.SENT,
        providerKey: this.key,
      },
    });

    console.log(`[Email:simulated] To: ${input.email} | ${input.subject}`);

    return { success: true, logId: log.id };
  }
}
