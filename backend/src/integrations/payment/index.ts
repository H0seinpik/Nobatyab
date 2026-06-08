import { env } from "../../config/env.js";
import type { PaymentProvider } from "./payment.provider.js";
import { SimulatedPaymentProvider } from "./simulated.payment.js";

let paymentProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (paymentProvider) return paymentProvider;

  switch (env.integrations.paymentProvider) {
    case "simulated":
    default:
      paymentProvider = new SimulatedPaymentProvider();
      break;
  }

  return paymentProvider;
}
