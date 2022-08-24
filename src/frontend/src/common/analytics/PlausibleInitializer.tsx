import Script from "next/script";
import ENV from "src/common/constants/ENV";

// The non-secret API key used to identify the app to Plausible.io
const PLAUSIBLE_KEY = ENV.PLAUSIBLE_FRONTEND_KEY;

/**
 * Initializes Plausible.io analytics for anonymous usage statistics.
 *
 * This component does not actually do the initialization itself.
 * It mounts a <script> tag that does the Plausible initialization.
 *
 * Plausible provides lightweight, privacy-focused analytics. One of the major
 * benefits of using Plausible is that it's so privacy-focused, it's GDPR
 * compliant out-of-the-box and is built to avoid leaking any personal data
 * from our users: https://plausible.io/privacy-focused-web-analytics
 *
 * We use Plausible to gather very general, anonymized usage info: pageview
 * counts, country of origin, etc. Unlike our other analytics which track more
 * fine-grained usage details, Plausible events are almost totally anonymous,
 * so Plausible always runs. It runs on every page -- public or logged-in only
 * -- and for all users, regardless of logged-in status.
 *
 * Usage note: Weirdly, even though this boils down to being a <script> tag,
 * Next.js does not like it to be present in a Next `Head` or `Html` component.
 * Instead, just put it anywhere in the "normal" flow of components, so long as
 * it's high enough to mount on every view/page.
 *
 * --- SPAs, Plausible, and double count bug // What's that `id` doing? ---
 * In the Plausible docs, they specifically call out that for Single Page Apps
 * running Next.js, there's a bug where the script can load twice and cause
 * double counting in Plausible: https://plausible.io/docs/spa-support
 * They recommend looking at various workarounds:
 *   https://github.com/vercel/next.js/issues/9070#issuecomment-552981178
 * When I [Vince] implemented it with Next's `Script`, I didn't see the problem
 * show up, but one of the comments mentioned providing an `id` value helped
 * prevent Next from re-mounting the script, so I cargo-culted that. I don't
 * think it's why I never saw problem, but harmless enough to leave in.
 */
export function PlausibleInitializer(): JSX.Element | null {
  // PLAUSIBLE_KEY should exist in all envs, but if empty/missing, don't run.
  return PLAUSIBLE_KEY ? (
    <Script
      id="plausibleAnalyticsScript"
      src="https://plausible.io/js/plausible.js"
      data-domain={PLAUSIBLE_KEY}
    />
  ) : null;
}
