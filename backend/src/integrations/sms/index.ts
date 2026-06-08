import { env } from "../../config/env.js";
import type { SmsProvider } from "./sms.provider.js";
import { SimulatedSmsProvider } from "./simulated.sms.js";

let smsProvider: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (smsProvider) return smsProvider;

  switch (env.integrations.smsProvider) {
    case "simulated":
    default:
      smsProvider = new SimulatedSmsProvider();
      break;
  }

  return smsProvider;
}
