export function stripProtocol(url: string | undefined): string | undefined {
  if (url === undefined) {
    return undefined;
  }
  const re = /^[^:]*:\/\//i;
  return url.replace(re, "");
}
