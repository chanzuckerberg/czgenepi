import { QueryClient } from "@tanstack/react-query";

/**
 * WARNING -- please AVOID importing and using unless you really, really gotta.
 *
 * This is the underlying `queryClient` instance that is used by react-query's
 * `QueryClientProvider` to provide the package's functionality. In most cases,
 * you should not be directly using queryClient, and instead should be creating
 * hooks (eg, via `useQueryClient`) that are used in React code and are getting
 * access to the underlying queryClient via QueryClientProvider being upstream
 * on the render tree.
 *
 * However, in some cases, you need to access the queryClient outside of a
 * React component. Even then, you can frequently come up with a solution to
 * avoid direct use: for example, if you need queryClient data in a redux
 * reducer, you could have a dispatch from a React component include the
 * queryClient data you need as well as whatever other info is required for
 * the payload. But in a few cases, you it really, truly is better to directly
 * import and use the queryClient.
 *
 * Finally, the reason this is separated out and not just in the same file
 * as the QueryClientProvider is to avoid circular dependencies. Since that
 * gets set up at the root of the app, if we export the queryClient from
 * there, it's easy to fall into circular deps. So we export it from a
 * separate file to make importing it other places less of a headache.
 */
export const queryClient = new QueryClient();
