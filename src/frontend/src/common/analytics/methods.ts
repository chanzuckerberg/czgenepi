/**
 * Funcs that handle calling the various Segment methods we use for analytics.
 *
 * Broadly speaking, our data capture for analytics splits into three types:
 * - Events: A discrete "thing" happening in our app, generally initiated by
 *   a user, but could also could be an event to track an internal happening
 *   (e.g., noting an upload failing because of a BE error).
 *     Handled by `analyticsTrackEvent`
 * - User info: Capturing info on the user. We make sure to de-identify the
 *   user and only send up non-PII data to analytics. This occurs when the
 *   app loads, and also if they later change something about how they are
 *   seen as a user (e.g., which group they are viewing).
 *     Handled by `analyticsSendUserInfo`
 * - Page/Route: Noting when the user's page changes and recording what page
 *   they are now on. This happens for every route change.
 *     Handled by `analyticsRecordRouteChange`
 *
 * For all of the functions here, if a user has opted-out of analytics, the
 * functions will do nothing. That way these functions can be safely called
 * in the rest of our code and all of the opt-in/out logic is taken care of.
 */
import { debounce, isEmpty, isEqual } from "lodash";
import { EVENT_TYPES } from "./eventTypes";

/**
 * Values we consider reasonable to send to Segment as properties of event.
 *
 * Note that `undefined` is also acceptable within the event properties object
 * as a value, but it is instead interpreted as "delete this key" when Segment
 * receives. The `analyticsTrackEvent` function allows undefined, but for
 * clarity it's not considered an EventValue since it's not a value, per se.
 *
 * This is a convention we are choosing to make. Segment does not care what is
 * sent, this could be `any` type, but we want to ensure a flat structure of
 * key-value pairs for downstream analysis since the structure of the event
 * properties implicitly determines the schema used for the event table when
 * Segment syncs with the data warehouse.
 */
type EventValue = string | number | boolean | null;

/**
 * Send occurrence of an event we track to Segment for analytics.
 *
 * Fires off a Segment `track` event. If user is opted-out of analytics, this
 * function does nothing.
 *
 * When calling this function, be careful to ensure it only gets called once
 * per event. There are a couple gotchas in our app around components double
 * mounting -- see https://app.shortcut.com/genepi/story/204578 -- so it is
 * usually best to avoid firing an event on component mount, since that can
 * result in duplicates. Be sure to verify that your event is firing as
 * expected in the Segment debugger before considering any work around
 * implementing or changing an event complete.
 *
 * Args:
 *   eventType (str, from EVENT_TYPES enum): canonical, unique name for event
 *   additionalEventData (obj): any additional data pertaining to event
 *     --- IMPORTANT USAGE NOTES ---
 *     The structure of this object will determine the (implicitly created)
 *     schema that Segment makes when it lands event in data warehouse. So:
 *     - All the keys in additionalEventData should be in **snake_case** to
 *     match expectation when working with analytics database.
 *     - additionalEventData should be a flat object of simple key-value pairs.
 *     You can send `undefined` for a value, but it will cause the key to be
 *     considered deleted for that event when it lands in Segment.
 */
export function analyticsTrackEvent(
  eventType: EVENT_TYPES,
  additionalEventData: Record<string, EventValue | undefined> = {}
): void {
  if (window.analytics && window.isCzGenEpiAnalyticsEnabled) {
    window.analytics.track(eventType, additionalEventData);
  }
}

// Info on user that we send for analytics. Note that user is de-identified.
interface AnalyticsUserInfo {
  anonUserId?: string;
  groupId?: number;
  groupName?: string;
}
/**
 * Helper to extract de-identified user info for sending to analytics.
 *
 * Important to have a standardized way because we need to ensure that the
 * data being pulled is consistent across the different ways we `identify`:
 * both initial app load via segmentInitScript and later user info changes
 * via analyticsSendUserInfo. For more info, see analyticsSendUserInfo docs.
 *
 * Also important because we need to be sure that we don't accidentally pull
 * PII and send as part of an `identify`. The data this helper pulls is the
 * non-PII data that's safe for analytics and we don't want to inadvertently
 * expose any sensitive data from FE to analytics.
 *
 * TODO -- This function will need to grow in complexity and probably alter
 * its signature once we have multi-group membership in place.
 */
export function extractAnalyticsUserInfo(userInfo: User): AnalyticsUserInfo {
  // TODO [Vincent, near future] Below is a temporary anonymous ID for dev work
  // and will be replaced soon by a proper anonymized user ID once that aspect
  // is in place in the backend and comes with rest of userInfo data.
  const PLACEHOLDER_ANON_USER_ID = "warrrbargl";
  return {
    anonUserId: PLACEHOLDER_ANON_USER_ID,
    groupId: userInfo.group.id,
    groupName: userInfo.group.name,
  };
}

/**
 * Send user info to Segment. Initial app load handled elsewhere, see below.
 *
 * Sends de-identified user info to Segment. It tracks user's current group
 * and should be re-fired every time the user changes the group that they
 * are currently operating as (if they're in multiple groups). If user is
 * opted-out of analytics, this function does nothing.
 *
 * Because of how our app loads user info and the Segment analytics framework,
 * there is a race condition: we don't know if user info from BE or analytics
 * will finish first. As such, we do **not** use this function as part of the
 * app's initial load. We fire off first `identify` method (assuming opt-in)
 * as part of the SegmentInitializer -> segmentInitScript interaction. By
 * relying on the init script to handle first `identify`, we can avoid the
 * race condition.
 *   IMPORTANT: Because of ^^^ above, we must ensure that the `identify` call
 *   in segmentInitScript matches the structure of how `identify` is used here
 *   and that SegmentInitializer is pulling that same data to pass to script,
 *   otherwise the structure of the `identify` payload will change depending
 *   on where it came from and it will cause problems for our data analyst.
 */
let previouslySentUserInfo: AnalyticsUserInfo = {};
function analyticsSendUserInfo_(userInfo: User): void {
  const analyticsUserInfo = extractAnalyticsUserInfo(userInfo);
  if (isEmpty(previouslySentUserInfo)) {
    // Very first user info payload handled by Segment init script.
    // If this is empty now, record info, but skip doing anything.
    previouslySentUserInfo = analyticsUserInfo;
  } else if (
    window.analytics &&
    window.isCzGenEpiAnalyticsEnabled &&
    !isEqual(previouslySentUserInfo, analyticsUserInfo)
  ) {
    window.analytics.identify(analyticsUserInfo.anonUserId, {
      group_id: analyticsUserInfo.groupId,
      group_name: analyticsUserInfo.groupName,
    });
    previouslySentUserInfo = analyticsUserInfo;
  }
}
// Sending user info (ignoring app load `identify` call) usually happens based
// on `useUserInfo` calls. Since these tend to bunch up and get called one on
// top of the other, we debounce so we don't spam analytics.
export const analyticsSendUserInfo = debounce(analyticsSendUserInfo_, 500, {
  trailing: true,
});

/**
 * Record page change in Segment. Meant for use in Nextjs router.events.
 *
 * The Nextjs `router` allows you to subscribe to various events. This func is
 * subscribed to the routeChangeComplete event, so whenever the route changes,
 * we kick off an analtyics call and report new page to Segment (assuming that
 * the user has opted in to analytics, if not, it's a no-op).
 *
 * While this should be a simple process as outlined above, we currently have
 * an issue where the router fires off lots of duplicate "changes" when the
 * app is loading. See this ticket for more details:
 *   FIXME: https://app.shortcut.com/genepi/story/204580
 * To avoid spamming a bunch of duplicate page change events, we keep a var
 * of the previouslyRecordedRoute: if a new route "change" matches the "change"
 * we just saw, we ignore it and do nothing. This prevents firing duplicate
 * `page` calls until we can fix whatever is causing the weird router stuff.
 */
let previouslyRecordedRoute = "";
export function analyticsRecordRouteChange(pageUrl: string): void {
  if (
    window.analytics &&
    window.isCzGenEpiAnalyticsEnabled &&
    previouslyRecordedRoute !== pageUrl
  ) {
    window.analytics.page();
    previouslyRecordedRoute = pageUrl;
  }
}
