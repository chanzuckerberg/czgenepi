export function stripProtocol(url?: string): string {
  if (!url) {
    return "";
  }
  const re = /^[^:]*:\/\//i;
  return url.replace(re, "");
}

export function hasQueryParam(param: string): boolean {
  if (typeof window !== "undefined") {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.has(param);
  }

  return false;
}
