export function getApiErrorMessage(error: unknown, fallback = "عملیات ناموفق بود"): string {
  const message = (
    error as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data?.error?.message;
  return message || fallback;
}
