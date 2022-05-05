import Script from "next/script";
import React from "react";
// import ENV from "src/common/constants/ENV";

// TODO Convert `data-domain-script` to being pulled from an ENV var
// The non-secret API key used to identify the app to OneTrust.
const ONE_TRUST_KEY = "c3428097-e56e-4f3a-ae48-5d1d26761bed-test";

// Not totally clear on purpose of this script, but it's part of OneTrust
// install instructions. TODO Figure out what it's doing, maybe remove?
const ONE_TRUST_ADD_ON_SCRIPT = "/oneTrustWrapperScript.js";

// Keyword to enable scripts with that class if user opts-in via OneTrust.
export const ONE_TRUST_ENABLING_CLASS = "optanon-category-C0002";

/**
 * Initializes OneTrust usage, enabling user to opt-in/out of analytics, etc.
 *
 * This component does not actually do the initialization itself.
 * It mounts <script> tags that do the OneTrust initialization.
 *
 * TODO [Vince]: Write some docs explaining method of action for OneTrust
 */
export function OneTrustInitializer() {
  return (
    <>
      <Script
        src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
        type="text/javascript"
        charSet="UTF-8"
        data-domain-script={ONE_TRUST_KEY}
      />
      <Script type="text/javascript" src={ONE_TRUST_ADD_ON_SCRIPT} />
    </>
  );
}
