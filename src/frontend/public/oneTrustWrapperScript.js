// Callback function for OneTrust. Fires on load and on OT settings changes.
// See docs in `OneTrustInitializer` component for explanation of use.
function OptanonWrapper() {
  // OneTrust API is poorly documented, feels shaky. Try/catch everything, JIC.
  try {
    const ANALYTICS_GROUP = "C0002";  // Needs to match `OneTrustInitializer`
    const currentActiveGroups = window.OnetrustActiveGroups;
    const isAnalyticsEnabled = currentActiveGroups.includes(ANALYTICS_GROUP);
    // Attach to window so we can access in React
    window.isCzGenEpiAnalyticsEnabled = isAnalyticsEnabled;
  } catch (error) {
    console.warn("Something went wrong with OneTrust. Please refresh. Debug:", error);
  }
}
