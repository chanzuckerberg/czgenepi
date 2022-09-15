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
import {
  getCurrentGroupFromUserInfo,
  getUserGroupInfoByGroupId,
} from "src/common/utils/userInfo";
import { EventData, EVENT_TYPES } from "./eventTypes";

/**
 * We send the below pieces of info with every analytics call if possible.
 *
 * These are common pieces of data we want attached to every analytics message
 * so they're available downstream for easier analytics works. In some cases,
 * the data might not be available or exist for some reason. It is okay for
 * them to occasionally not be available, so long as it's rare (< 1%).
 *
 * Right now, this is just a set of user info traits, but over time it could
 * evolve to include things like current software version, etc. That said,
 * try to be sparing about adding to this collection since they have to go
 * on every message up to analytics platform.
 *
 * Necessary to be a `type` rather than `interface` so TS is happy with is use
 * downstream as a generic object. See this TypeScript issue and comment:
 * https://github.com/microsoft/TypeScript/issues/15300#issuecomment-371353444
 */
type CommonAnalyticsInfo = {
  group_id?: number;
};

/**
 * Send occurrence of an event we track to Segment for analytics.
 *
 * Fires off a Segment `track` event. If user is opted-out of analytics, this
 * function does nothing.
 *
 * --- Usage ---
 * Most `track` events involve additional data beyond simply noting the type
 * of event that just occurred. This additional data is passed as an optional,
 * but generally used, second arg. Also, if this second arg is used, the
 * event's TS type /must/ be given as well. A few track events may require
 * no additional info beyond noting the event happened: in that case, the func
 * takes a single arg and /no/ TS event type.
 *
 * Example: Including additional event info (more commonly used case)
 *   analyticsTrackEvent<AnalyticsFooEvent>(
 *     EVENT_TYPES.FOO_EVENT, {
 *       foo_bar: "additional event data",
 *       fizz_buzz: "as structured by AnalyticsFooEvent type"
 *     });
 * Example: No additional event info (less commonly used case)
 *   analyticsTrackEvent(EVENT_TYPES.BAR_EVENT);
 *
 * All the enumerated EVENT_TYPES and their associated event TS types should
 * live in the `eventTypes.ts` file. There are more docs in there about how
 * to structure the additionalEventData object payloads.
 *
 * --- Other Notes ---
 * All events include some generic, common info (CommonAnalyticsInfo). It
 * is possible to overwrite those with your `additionalEventData` if there
 * is a key collision. This is intentional -- some events could potentially
 * overrule the common info aspect -- but should be very unusual.
 *
 * When calling this function, be careful to ensure it only gets called once
 * per event. There are a couple gotchas in our app around components double
 * mounting -- see https://app.shortcut.com/genepi/story/204578 -- so it is
 * usually best to avoid firing an event on component mount, since that can
 * result in duplicates. Be sure to verify that your event is firing as
 * expected in the Segment debugger before considering any work around
 * implementing or changing an event complete.
 *
 * When passing additionalEventData, it's best to directly construct it as an
 * object in part of the function call to trigger "Excess Property Checking"
 * and help ensure that the passed event data matches the event TS type being
 * specified for the event. If instead you do it like this,
 *     NOT GREAT  ---> analyticsTrackEvent<AnalyticsFooEvent>(
 *     PLZ AVOID  --->   EVENT_TYPES.FOO_EVENT, additionalFooEventData);
 * then it's possible for the passed `additionalFooEventData` to have extra
 * properties beyond what the `AnalyticsFooEvent` specifies and you won't get
 * any kind of TS warning. But if you construct the object within the function
 * call, TS will complain if that object has keys beyond its specified TS type.
 *
 * --- TypesScript Apologia ---
 * There is a lot of TS fanciness going on here. I'm (Vince) sorry for that.
 *
 * The goal here was to create A) a clear and documented set of event structures
 * for downstream analysts to reference (by viewing the `eventTypes.ts` file)
 * and also B) ensure some level of dev guardrails to prevent accidentally
 * changing how `additionalEventData` for any given event is structured as the
 * codebase changes or if the same event can come from multiple places in code.
 *
 * Part (A) is pretty self-explanatory, but (B) is less so and it's why we need
 * all the complicated TS stuff below. Basically, whatever event data we send
 * up to Segment via a `track` call will **implicitly** define the DB schema
 * used to store that event downstream. But because this creation is implicit,
 * if we change the structure of that payload later it can cause problems for
 * downstream analysis. It's possible to do without issue, but accidentally
 * changing it is generally bad. So all the TS fanciness is to ensure that,
 * when additionalEventData is being sent, we have a clear structure for the
 * additional data, we adhere to that, and we only change it on purpose.
 *
 * One weak spot in the current TS implementation is that an event type that
 * /should/ have additionalEventData could get used in the single arg format
 * and thus would not send up any additional data yet cause no TS errors. I
 * (Vince) couldn't come up with a reasonable way to avoid that problem, so
 * there are no guardrails around it, but hopefully it would be an uncommon
 * mistake and easy to catch in a code review. Also, some of the TS error
 * messages are a bit obtuse, but the confusing ones at least point you to
 * this function and hopefully will be easy to fix once the dev sees the docs.
 */
// Single arg, no additionalEventData and no TS event type
export function analyticsTrackEvent(eventType: EVENT_TYPES): void;
// Two args, has additionalEventData and requires a TS event type
// The weird `never` default combines with second `extends` to require TS type
// For details of why, see https://stackoverflow.com/a/57683742
export function analyticsTrackEvent<
  T extends EventData = never,
  EventType extends T = T
>(eventType: EVENT_TYPES, additionalEventData: EventType): void;
// Implementation signature
export function analyticsTrackEvent(
  eventType: EVENT_TYPES,
  additionalEventData?: EventData
): void {
  const addlEventData = additionalEventData || {};
  if (window.analytics && window.isCzGenEpiAnalyticsEnabled) {
    const eventData = {
      ...getCommonUserInfo(),
      ...addlEventData,
    };
    window.analytics.track(eventType, eventData);
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
 * Returns the necessary info for analytics or `undefined` if info is
 * not ready yet because user/group info still undergoing initialization.
 * If returning `undefined`, do NOT fire off an `identify` call, not ready yet.
 *
 * Optional second arg of `explicitGroupId`. Usually we want the redux state
 * to determine user's current group, but in some cases -- like when user is
 * changing from viewing one group to another -- we can have a race condition
 * with the redux state. In those cases, we can explictly set the groupId
 * the user should be identified as belonging to.
 *
 * Important to have a standardized way we extract de-identified user info
 * because we need to ensure the data being pulled is consistent across the
 * different ways we `identify`: both initial app load via segmentInitScript
 * and later user/group info changes via analyticsSendUserInfo.
 * For more info, see analyticsSendUserInfo docs.
 *
 * Also important because we need to be sure that we don't accidentally pull
 * PII and send as part of an `identify`. The data this helper pulls is the
 * non-PII data that's safe for analytics and we don't want to inadvertently
 * expose any sensitive data from FE to analytics.
 */
export function extractAnalyticsUserInfo(
  userInfo: User,
  explicitGroupId?: number
): AnalyticsUserInfo | undefined {
  let group = undefined;
  if (explicitGroupId) {
    group = getUserGroupInfoByGroupId(userInfo, explicitGroupId);
  } else {
    group = getCurrentGroupFromUserInfo(userInfo);
  }
  // If group false-y, user info is loaded but group info is not ready yet.
  if (!group) {
    return undefined;
  }
  return {
    anonUserId: userInfo.analyticsId,
    groupId: group.id,
    groupName: group.name,
  };
}

/**
 * Send user info to Segment. Initial app load handled elsewhere, see below.
 *
 * Sends de-identified user and group info to Segment. It should be re-fired
 * every time the user changes the group they are currently operating as
 * (if they're in multiple groups). If user is opted-out of analytics,
 * then this function will do nothing.
 *
 * Because of how our app loads and the Segment analytics framework, there is
 * a race condition: we don't know if the user/group info init or analytics
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
function analyticsSendUserInfo_(
  userInfo: User,
  explicitGroupId?: number
): void {
  const analyticsUserInfo = extractAnalyticsUserInfo(userInfo, explicitGroupId);
  // User info loaded, but user/group init not complete. Do nothing for now.
  if (!analyticsUserInfo) {
    return;
  }
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
// Sending user info (ignoring app load `identify` call) can happen based on
// `useUserInfo` calls. Since these tend to bunch up and get called one on
// top of the other, we debounce so we don't spam analytics. Also beneficial
// because short pause generally ensures group init is complete in redux.
export const analyticsSendUserInfo = debounce(analyticsSendUserInfo_, 500, {
  trailing: true,
});

/**
 * Pulls common info pertaining to the user (eg, active group, etc)
 *
 * This relies on the Segment analytics framework `user().traits()` call,
 * which basically looks up the last set of user info sent to Segment by the
 * browser and returns that. We could achieve something similar by relying on
 * the `previouslySentUserInfo` variable elsewhere, but this should be more
 * reliable because it provides whatever was last sent, no matter whether it
 * was from the `segmentInitScript` call or from normal methods.
 */
function getCommonUserInfo(): CommonAnalyticsInfo {
  let commonUserInfo = {}; // Default case if we have no traits yet
  if (window?.analytics?.user) {
    const traits = window.analytics.user().traits();
    commonUserInfo = {
      group_id: traits.group_id,
    };
  }
  return commonUserInfo;
}

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
    const commonAnalyticsInfo = getCommonUserInfo();
    window.analytics.page(commonAnalyticsInfo);
    previouslyRecordedRoute = pageUrl;
  }
}
