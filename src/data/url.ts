export function isHttpsUrl(raw: string): boolean {
  try {
    return new URL(raw).protocol === 'https:';
  } catch {
    return false;
  }
}

export function safeImageUrl(raw: string): string {
  return raw.startsWith('/images/') || isHttpsUrl(raw) ? raw : '';
}
