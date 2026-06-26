export function sortNotificationsByNewest<T extends { createdAt: string; id: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });
}
