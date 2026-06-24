import { env } from "../../config/env.js";
import type { EmailProvider } from "./email.provider.js";
import { SimulatedEmailProvider } from "./simulated.email.js";
import { SmtpEmailProvider } from "./smtp.email.js";

let emailProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (emailProvider) return emailProvider;

  switch (env.integrations.emailProvider) {
    case "smtp":
      emailProvider = new SmtpEmailProvider();
      break;
    case "simulated":
    default:
      emailProvider = new SimulatedEmailProvider();
      break;
  }

  return emailProvider;
}

export type { EmailProvider, EmailResult } from "./email.provider.js";
