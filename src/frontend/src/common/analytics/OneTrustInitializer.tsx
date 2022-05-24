import Script from "next/script";
import React from "react";
import ENV from "src/common/constants/ENV";
import { useUserInfo } from "src/common/queries/auth";

// The non-secret API key used to identify the app to OneTrust.
const ONETRUST_KEY = ENV.ONETRUST_FRONTEND_KEY;

// Sets up callback function that OneTrust will run after init and any change
// to settings. Important because we're a single page app. See below docs.
const ONETRUST_ADD_ON_SCRIPT = "/oneTrustWrapperScript.js";

// Internal value used by OneTrust to describe group of analytics.
const ANALYTICS_GROUP = "C0002"; // Needs to match in ONETRUST_ADD_ON_SCRIPT
// Keyword to enable scripts with that class if user opts-in via OneTrust.
export const ONETRUST_ENABLING_CLASS = `optanon-category-${ANALYTICS_GROUP}`;

/**
 * Initializes OneTrust usage, enabling user to opt-in/out of analytics, etc.
 *
 * This component does not actually do the initialization itself.
 * It mounts <script> tags that do the OneTrust initialization.
 *
 * We only present OneTrust interaction (and thus also only potentially gather
 * app usage analytics) for logged-in users. We check they are logged-in
 * before we mount the script and bring in OneTrust. Additionally, we only
 * attempt to use OneTrust if we have a key present for it. Every environment
 * /should/ have a key, but just in case it's missing, it defaults to empty
 * string and we do not attempt to use OneTrust (and thus, analytics either).
 *
 * Usage note: Weirdly, even though this boils down to being a <script> tag,
 * Next.js does not like it to be present in a Next `Head` or `Html` component.
 * Instead, just put it anywhere in the "normal" flow of components. This uses
 * a react-query call, so it also needs to be in the `QueryClientProvider`,
 * but beyond that it just needs to be somewhere fairly high up so it mounts
 * on every logged-in view/page.
 *
 *  --- Method of Action: how does OneTrust work? ---
 * The core idea of OneTrust is that it can block other <script> tags from
 * loading on the page unless the user's OneTrust settings opt them in. While
 * OneTrust has a lot of language about cookies, it isn't generally trying to
 * directly block cookies, but rather prevent other scripts from running that
 * would make use of those cookies. OneTrust stores this opt-in/out preference
 * as a cookie on the user's browser (Note: if the user changes to a different
 * browser, they will have to set opt-in/out settings again, it is NOT a user
 * record aspect in our DB), and from those preferences OneTrust determines
 * which <script> tags on the page should be allowed to run.
 *
 * OneTrust accomplishes this <script> enabling/disabling by changing the
 * `type` attr on the <script> tag. All scripts being controlled by OneTrust
 * should start as "text/plain", which browsers simply will not run. Then, if
 * OneTrust determines a script should run, it changes its `type` to being
 * "text/javascript" instead, and the browser picks up the change, sees it as
 * a runnable script, and the script runs like usual at that point.
 *
 * --- ONETRUST_ADD_ON_SCRIPT: OptanonWrapper callback function  ---
 * OneTrust provides a callback via the global function `OptanonWrapper` which
 * we define in the ONETRUST_ADD_ON_SCRIPT. It gets fired off once OneTrust
 * has loaded, and then also on any subsequent changes the user makes to their
 * OneTrust settings. Because we are a single page app (SPA), this is very
 * important to us: since OneTrust only enables/disables a <script> tag from
 * loading, if OneTrust enables analytics, but then later disables it, all that
 * gets disabled is the script that initially loaded analytics. Since CZ GE is
 * a SPA, analytics would continue to run until user refreshes their browser.
 *
 * To solve this, we create a window-level var `isCzGenEpiAnalyticsEnabled`
 * inside the callback function. On any change to OneTrust settings, it will
 * properly set that variable. Thus we can rely on it to tell us if the user
 * is currently opting-in to analytics, and not just assuming that because
 * analytics once got loaded, they remain opted-in. As long as our analytics
 * events first check for `isCzGenEpiAnalyticsEnabled`, we can be sure our
 * user remains opted-in and fire off the analytics event.
 */
export function OneTrustInitializer() {
  // `userInfo` will be false-y if user is not logged in
  const { data: userInfo } = useUserInfo();
  return userInfo && ONETRUST_KEY ? (
    <>
      <Script
        src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
        type="text/javascript"
        charSet="UTF-8"
        data-domain-script={ONETRUST_KEY}
      />
      <Script type="text/javascript" src={ONETRUST_ADD_ON_SCRIPT} />
    </>
  ) : null;
}
