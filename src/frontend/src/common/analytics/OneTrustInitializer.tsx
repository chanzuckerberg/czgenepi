import Script from "next/script";
import React from "react";
import ENV from "src/common/constants/ENV";

// The non-secret API key used to identify the app to OneTrust.
const ONETRUST_KEY = ENV.ONETRUST_FRONTEND_KEY;

// Sets up callback function that OneTrust will run after init and any change
// to settings. Important because we're a single page app. See below docs.
const ONETRUST_ADD_ON_SCRIPT = "/oneTrustWrapperScript.js";

// Keyword to enable scripts with that class if user opts-in via OneTrust.
// TODO break out the C0002 aspect probably?
export const ONETRUST_ENABLING_CLASS = "optanon-category-C0002";

/**
 * Initializes OneTrust usage, enabling user to opt-in/out of analytics, etc.
 *
 * This component does not actually do the initialization itself.
 * It mounts <script> tags that do the OneTrust initialization.
 *
 * TODO [Vince]: Write some docs explaining method of action for OneTrust
 *
 * TODO [Vince]: Explain add on script
 */
export function OneTrustInitializer() {
  // Every environment should have a ONETRUST_KEY env var available, but if
  // it's not there for some reason, we keep OneTrust off, which, in turn,
  // will prevent any scripts it controls from running (eg, analytics).
  console.log("ONETRUST_KEY", ONETRUST_KEY); // REMOVE
  return ONETRUST_KEY ? (
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
