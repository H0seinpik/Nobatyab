import nodemailer from "nodemailer";
import { EmailStatus } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../config/database.js";
import type { EmailProvider, EmailResult } from "./email.provider.js";

export class SmtpEmailProvider implements EmailProvider {
  readonly key = "smtp";
  private transporter = nodemailer.createTransport({
    host: env.integrations.smtp.host,
    port: env.integrations.smtp.port,
    secure: env.integrations.smtp.port === 465,
    auth: {
      user: env.integrations.smtp.user,
      pass: env.integrations.smtp.pass,
    },
  });

  async send(input: {
    email: string;
    subject: string;
    body: string;
    userId?: string;
    notificationId?: string;
  }): Promise<EmailResult> {
    try {
      await this.transporter.sendMail({
        from: env.integrations.smtp.from,
        to: input.email,
        subject: input.subject,
        text: input.body,
      });

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

      return { success: true, logId: log.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "SMTP send failed";
      const log = await prisma.emailLog.create({
        data: {
          email: input.email,
          subject: input.subject,
          body: input.body,
          userId: input.userId,
          notificationId: input.notificationId,
          status: EmailStatus.FAILED,
          providerKey: this.key,
        },
      });
      console.error(`[Email:smtp] Failed to send to ${input.email}:`, message);
      return { success: false, logId: log.id, errorMessage: message };
    }
  }
}
