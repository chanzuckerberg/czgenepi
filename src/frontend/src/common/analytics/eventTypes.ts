/**
 * Canonical list of all the various event types we track with analytics.
 *
 * This exists to ensure consistency/clarity across types and to provide
 * a reference for data analysts working on CZ GE.
 *
 * --- REQUIREMENTS for adding new event types ---
 * - Each event type should have a comment with a plain-English description
 *   of what the event means.
 * - Event types should be written in SCREAMING_SNAKE_CASE
 * - Each entry in the enum should be a duplicate key/value string enum
 * - If an event type entails sending additional data about what happened
 *   (most events do), there should be a matching event TypeScript type below
 *   in this file that shows the structure of the additional event data.
 *   => The TS type should be named according to the event type as follows:
 *      Event of `SOME_EVENT_FOO` <--> TS type of `AnalyticsSomeEventFoo`
 */
export enum EVENT_TYPES {
  // User has been sent to Nextstrain to view a phylo tree
  TREE_VIEW_NEXTSTRAIN = "TREE_VIEW_NEXTSTRAIN",

  // User has kicked off the creation of a Nextstrain phylo tree
  TREE_CREATION_NEXTSTRAIN = "TREE_CREATION_NEXTSTRAIN",

  // User clicked on the "OpenInGalagoButton" on the phylo tree table
  TREE_ACTIONS_CLICK_GALAGO = "TREE_ACTIONS_CLICK_GALAGO",

  // User has been sent to Galago to view a phylo tree
  TREE_VIEW_GALAGO = "TREE_VIEW_GALAGO",

  // User has been sent over to UShER site. UShER will now create tree and
  // display it on their site. External, so can't tell if tree succeeds/fails.
  // **No `additionalEventData`**. Just tracking event occurrence right now.
  TREE_CREATION_VIEW_USHER = "TREE_CREATION_VIEW_USHER",

  // User has downloaded a file of the actual phylo tree
  TREE_DOWNLOAD_TREE_FILE = "TREE_DOWNLOAD_TREE_FILE",

  // User downloaded a template of sample identifiers and metadata that shows
  // the selected samples. User can add more metadata to overlay on tree view.
  TREE_DOWNLOAD_SELECTED_SAMPLES_TEMPLATE = "TREE_DOWNLOAD_SELECTED_SAMPLES_TEMPLATE",

  // User has successfully uploaded new samples
  SAMPLES_UPLOAD_SUCCESS = "SAMPLES_UPLOAD_SUCCESS",

  // User downloading data about samples to a file(s)
  // Does not currently address success/failure, but download failures are very
  // rare, so generally safe to not be concerned about that aspect for now.
  SAMPLES_DOWNLOAD_FILE = "SAMPLES_DOWNLOAD_FILE",

  // User is in multiple groups and is changing which group they are acting in.
  ACTIVE_GROUP_CHANGE = "ACTIVE_GROUP_CHANGE",
}

/**
 * Values we consider reasonable to send to Segment as properties of event.
 *
 * Note that `undefined` is also acceptable within the event properties object
 * as a value, but it is instead interpreted as "delete this key" when Segment
 * receives. We allow `undefined` to be passed as part of EventData, but for
 * clarity it's not considered an EventValue since it's not a value, per se.
 *
 * This is a convention we are choosing to make. Segment allows us to send
 * pretty much anything, but we want to ensure a flat structure of key-value
 * pairs for downstream analysis since the structure of the event properties
 * implicitly determines the schema used for the event table when Segment
 * syncs to the the data warehouse.
 *
 * We enforce this structure for EventData in the `analyticsTrackEvent` method
 * that kicks off the underlying Segment `track` by ensuring that all events
 * extend from that base structure.
 */
type EventValue = string | number | boolean | null;
export type EventData = Record<string, EventValue | undefined>;

// While we only send values of EventValue, sometimes we send a JSON string.
// For ease of readability below, we alias string for those cases.
type JsonString = string;

/**
 * Structure of additionalEventData for each EVENT_TYPES type that sends it.
 *
 * Most of the event types we track include some kind of additionalEventData
 * beyond just which EVENT_TYPES type occurred. For those event types, we have
 * a TypeScript type that details the structure of that data. These TS types
 * are here to provide A) documentation for data analysts working on CZ GE and
 * B) guardrails to prevent accidentally sending an incorrectly structured
 * payload for a given event type.
 *
 * The structure of the event data object we send in `track` call determines
 * the (implicitly created) schema that Segment makes when it lands the event
 * in downstream data warehouse. With this in mind, it's possible to update
 * these event TS types if/when scope expands, but it should be done carefully.
 * Changing from one value type to another can cause data loss and changing
 * around keys will mean a lot of NULLs showing up in the data warehouse.
 *
 * --- REQUIREMENTS for adding new event TS types ---
 * - Name the TS type so it matches up with EVENT_TYPES enum. Name as follows:
 *   => Event of `SOME_EVENT_FOO` <--> TS type of `AnalyticsSomeEventFoo`
 * - All the keys should be in **snake_case**.
 * - The structure should always be a **flat object**. (extends `EventData`)
 * - If you must send more complicated info (say, an array of IDs), convert
 *   it into a string (JSON.stringify, probably) and send the string.
 * - Always use `type`, never `interface`. (Necessary for generic extends)
 *   See https://github.com/microsoft/TypeScript/issues/15300#issuecomment-371353444
 * --- RECOMMENDATIONS for adding new event TS types ---
 * - Avoid optional keys or using value of `undefined` unless necessary.
 * - Document what each key means in the context of that event type.
 * - If a key holds JSON, use `JsonString` type and document what it contains.
 * - Try to avoid sending JSON strings if you can easily break it into multiple
 *   keys with simple values instead.
 * - When developing, try to avoid actually sending payload to Segment until
 *   you are confident in the structure for that event type: if you send it
 *   prematurely, you might have to wipe out that event's corresponding table
 *   due to schema weirdness which can be a hassle to deal with when testing.
 */

/** EVENT_TYPES.TREE_VIEW_NEXTSTRAIN */
export type AnalyticsTreeViewNextstrain = {
  // Tree that user is being sent to view
  tree_id: number;
};

/** EVENT_TYPES.TREE_CREATION_NEXTSTRAIN */
export type AnalyticsTreeCreationNextstrain = {
  // PK of the workflow that kicks off the creation of requested tree
  // Note: creating a tree kicks off process, it could still fail in pipeline.
  phylo_run_workflow_id: number;
  // Type of tree being created
  tree_type: string;
  // Location of samples used for tree creation. A null value indicates that
  // the user's group info was not successfully fetched before they created
  // a tree. This generally shouldn't happen.
  location_id: number | null;
  // Location of the user's group. This is provided for comparison with the
  // location_id above. A null value indicates that the user's
  // group was not successfully fetched before they created a tree. This
  // generally shouldn't happen.
  group_location_id: number | null;
  // Lineages selected for tree creation.
  selected_lineages: string;
  // Time range filter for tree creation. A null value indicates that
  // the user did not change the default value and there is
  // no start date set.
  start_date: FormattedDateType | null;
  // Time range filter for tree creation. A null value indicates that
  // the user did not change the default value and there is
  // no end date set.
  end_date: FormattedDateType | null;
};

/** EVENT_TYPES.TREE_ACTIONS_CLICK_GALAGO */
export type AnalyticsTreeActionsClickGalago = {
  // Tree that user clicked on
  tree_id: number;
};

/** EVENT_TYPES.TREE_VIEW_GALAGO */
export type AnalyticsTreeViewGalago = {
  // Tree that user is being sent to view
  tree_id: number;
};

/** EVENT_TYPES.TREE_DOWNLOAD_TREE_FILE */
export type AnalyticsTreeDownloadTreeFile = {
  // Tree user is downloading.
  // null indicates tree does not exist, but should be impossible if user
  // is downloading it. Mostly here to make TS happy, but if we ever get null
  // in this event for tree_id, it very likely indicates a bug with app.
  tree_id: number | null;
  // PK of the workflow that kicked off the creation of this tree.
  // Should never be null, but TS for underlying item does not guarantee it, so
  // the null possibility is mostly to keep TS happy. If null, app has a bug.
  phylo_run_workflow_id: number | null;
  // User can download tree with samples using either their Private IDs or
  // their Public IDs.
  sample_id_type: "PRIVATE" | "PUBLIC";
};

/** EVENT_TYPES.TREE_DOWNLOAD_SELECTED_SAMPLES_TEMPLATE */
export type AnalyticsTreeDownloadSelectedSamplesTemplate = {
  // Tree user is downloading template in regards to.
  // Can download template before tree done or tree failed. Null indicates such
  tree_id: number | null;
  // PK of the workflow that kicked off the creation of this tree.
  // Should never be null, but TS for underlying item does not guarantee it, so
  // the null possibility is mostly to keep TS happy. If null, app has a bug.
  phylo_run_workflow_id: number | null;
};

/** EVENT_TYPES.SAMPLES_UPLOAD_SUCCESS*/
export type AnalyticsSamplesUploadSuccess = {
  // How many samples the user just uploaded
  sample_count: number;
  // JSON array of all the IDs for newly created samples for this upload
  sample_ids: JsonString;
};

/** EVENT_TYPES.SAMPLES_DOWNLOAD_FILE*/
export type AnalyticsSamplesDownloadFile = {
  // How many samples the user is downloading info on
  sample_count: number;
  // JSON array of the public identifiers for these samples
  // Not the same as a sample PK, but it plus group_id is unique in DB
  // (based on context of how download happens, PKs are hard to obtain)
  sample_public_ids: JsonString;
  // User downloaded info on consensus genome (FASTA) for these samples
  includes_consensus_genome: boolean;
  // User downloaded genbank template for these samples
  includes_genbank_template: boolean;
  // User downloaded gisaid template for these samples
  includes_gisaid_template: boolean;
  // User downloaded info on metadata for these samples
  includes_sample_metadata: boolean;
};

/** EVENT_TYPES.ACTIVE_GROUP_CHANGE*/
export type AnalyticsActiveGroupChange = {
  // The group ID user had been actively viewing before changing groups.
  // NOTE: the `group_id` common analytics field should be identical to this
  // previous_group_id because we fire event at start of change. Nonetheless,
  // we track it as an explicit field to avoid any ambiguity.
  previous_group_id: number;
  // The group ID that the user is switching to viewing/acting as.
  new_group_id: number;
};
