// See detailed docs at `src/common/analytics/SegmentInitializer`.
// Bootstraps the Segment analytics once usage conditions are met.
// Uses immediately invoked function to not pollute global namespace.
(function () {
  const dataset = document.querySelector('#segment-init-script').dataset;
  const segmentKey = dataset.segmentKey;
  const anonUserId = dataset.anonUserId;
  // dataset only comes in as strings, but correct data type is number
  const groupId = Number(dataset.groupId);
  const groupName = dataset.groupName;
  // Load is mostly verbatim from Segment-provided snippet. Only change is dynamic key.
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey=segmentKey;;analytics.SNIPPET_VERSION="4.15.3";
  analytics.load(segmentKey);
  // Back to custom code. Send current page and de-identified user info.
  analytics.page({
    group_id: groupId,
  });
  analytics.identify(anonUserId,
    {
      group_id: groupId,
      group_name: groupName,
    });
  }}();
})();
