/**
 * Adds the `analytics` property for TypeScript to global window object.
 *
 * Our analytics library, Segment, adds the `analytics` object to the global
 * namespace. In our React code, we access it as `window.analytics`. This
 * file adds the appropriate types to `window`. The methods on `analytics`
 * is not an exhaustive listing of everything available via Segment, it's
 * just the methods we use in our app.
 *
 * I [Vince] found this a bit surprising as the way to add types to a global
 * object, but after some searching, it seems like the best way to do it.
 * References:
 *   https://stackoverflow.com/a/47130953
 *   https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-8.html#augmenting-globalmodule-scope-from-modules
 */

// Ensure this is treated as a module so we can add to global interface.
export {};

declare global {
  interface Window {
    // Below **adds** to Window properties, not a replacement.
    analytics?: {
      identify: (userId?: string, traits: Record<string, unknown>) => void;
      page: (properties: Record<string, unknown> | {}) => void;
      track: (eventType: string, properties: Record<string, unknown>) => void;
      // Unlike above methods, `user` only present once library finishes load
      user?: () => {traits: () => Record<string, unknown>};
    };
    isCzGenEpiAnalyticsEnabled?: boolean;
  }
}
