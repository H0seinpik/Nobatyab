export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const uploadsBase = import.meta.env.VITE_UPLOADS_URL;
  if (uploadsBase) return `${uploadsBase.replace(/\/$/, "")}${path}`;

  const apiUrl = import.meta.env.VITE_API_URL || "/api/v1";
  const origin = apiUrl.replace(/\/api\/v1\/?$/, "") || "";
  return `${origin}${path}`;
}
