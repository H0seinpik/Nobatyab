import { useRouter } from "vue-router";
import { getUserAvailability } from "@/services/smartBooking.service";

export async function hasUserAvailability(): Promise<boolean> {
  try {
    const entries = await getUserAvailability();
    return Array.isArray(entries) && entries.length > 0;
  } catch {
    return false;
  }
}

/** Always opens the smart-booking wizard (availability is step 1 inside). */
export function useSmartBookingNavigation() {
  const router = useRouter();

  async function goToSmartBooking() {
    await router.push("/smart-booking");
    return true;
  }

  return { goToSmartBooking, hasUserAvailability };
}
