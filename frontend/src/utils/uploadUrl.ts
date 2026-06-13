export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const uploadsBase = import.meta.env.VITE_UPLOADS_URL;
  if (uploadsBase) {
    return `${uploadsBase.replace(/\/$/, "")}${path}`;
  }

  // Same-origin relative path — Vite proxies /uploads to the API server in dev.
  return path.startsWith("/") ? path : `/${path}`;
}
