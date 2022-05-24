import Script from "next/script";
import React from "react";
import { ONETRUST_ENABLING_CLASS } from "src/common/analytics/OneTrustInitializer";
import ENV from "src/common/constants/ENV";

/**
 * Actual initialization of Segment done by raw JS script at below route.
 *
 * Recommended way to set up Segment is to use Segment-provided JS snippet.
 * However, their snippet is inline, which causes issues with our Content
 * Security Policy and is also a hassle to use inside React. So instead,
 * we made a static JS script file of it and run it via `src` reference.
 *
 * Additionally, the Segment snippet needs to know the "Write Key" -- it's
 * the non-secret API key for a given Segment integration -- so we pass
 * that value dynamically to the script via the script knowing its own ID
 * (it has a copy of the value for SEGMENT_SCRIPT_TAG_ID) to find itself
 * in the DOM, then pulls the passed value from the attr `data-segment-key`
 * which becomes DOMobject.dataset.segmentKey in the script.
 */
const SEGMENT_INIT_SCRIPT_ROUTE = "/segmentInitScript.js"; // in `public` dir
const SEGMENT_SCRIPT_TAG_ID = "segment-init-script";

// The non-secret API key used to identify the app doing analytics.
const SEGMENT_WRITE_KEY = ENV.SEGMENT_FRONTEND_KEY;

// What `type` attr the script starts with to prevent early firing.
// See docs below regarding interaction with OneTrust.
const INITIAL_SCRIPT_TYPE = "text/plain";

/**
 * Initializes Segment analytics, enabling later analytics calls in app.
 *
 * This component does not actually do the initialization itself.
 * It's a wrapper to alley-oop the init to the underlying JS snippet provided
 * by Segment, while also working with OneTrust and React/Next.js
 *
 * NOTE:
 * Mounting this component does not, by itself, kick off analytics init.
 * There are a couple gatekeepers that prevent unwanted initialization:
 *   1) The script tag starts off un-executable due to its type being
 *      "text/plain". This is connected to our use of OneTrust: if a user
 *      allows analytics, OneTrust will flip that to "text/javascript",
 *      causing the referenced script to run and initialize analytics.
 *      (it finds the script to flip via class `ONETRUST_ENABLING_CLASS`)
 *   2) There must be a truth-y value present for the SEGMENT_FRONTEND_KEY.
 *      We default to empty string when no env var present.
 *      As of right now, during initial development, there is no Segment key
 *      in Prod (we've also avoided creating a Prod integration on the Segment
 *      side for now). This means that, even if this code gets to Prod,
 *      no analytics will run right now on Prod.
 *
 * Usage note: Weirdly, even though this boils down to being a <script> tag,
 * Next.js does not like it to be present in a Next `Head` or `Html` component.
 * Instead, just put it anywhere in the "normal" flow of components. A good
 * place to put it is just under the `</Head>` in `_app.tsx`, but you could
 * put it somewhere else as well.
 */
export function SegmentInitializer() {
  const segmentWriteKey = ENV.SEGMENT_FRONTEND_KEY;
  return segmentWriteKey ? (
    <Script
      id={SEGMENT_SCRIPT_TAG_ID}
      type={INITIAL_SCRIPT_TYPE}
      src={SEGMENT_INIT_SCRIPT_ROUTE}
      data-segment-key={SEGMENT_WRITE_KEY}
      className={ONETRUST_ENABLING_CLASS}
    />
  ) : null;
}
