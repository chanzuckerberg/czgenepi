// See detailed docs at `src/common/analytics/SegmentInitializer`.
// Bootstraps the Segment analytics once usage conditions are met.
// Uses immediately invoked function to not pollute global namespace.
// TODO [Vince] -- Uncomment from here down once ready to start releasing
// analytics (either b/c behind OneTrust or a feature flag).
// NOTE: Make sure to discuss release timing with Product since we need
// to communicate info about analytics with users.
// Commenting out for now as way to absolutely ensure analytics remains off.
// (function () {
//   const segmentKey = document.querySelector(
//       '#segment-init-script').dataset.segmentKey;
//   // Mostly verbatim from Segment-provided snippet. Only change is dynamic key.
//   !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey=segmentKey;;analytics.SNIPPET_VERSION="4.15.3";
//   analytics.load(segmentKey);
//   analytics.page();
//   }}();
// })();
