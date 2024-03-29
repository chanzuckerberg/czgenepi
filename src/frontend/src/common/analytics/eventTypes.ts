import { Pathogen } from "../redux/types";

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

  // User hovered over the "Details" for a tree
  TREE_DETAILS_VIEW = "TREE_DETAILS_VIEW",

  // User has either just entered or changed pages in the process of uploading
  // samples. See event data docs for info on how to tell the difference.
  // NOTE: There is no event for user leaving the Upload flow in the middle.
  // Because of how leaving works, it would be hard to reliably capture this
  // event. Instead, we can check how many Upload flows made it to a successful
  // completion by correlating `SAMPLES_UPLOAD_SUCCESS` events with these. Any
  // flows that did not eventually have a SUCCESS must have ended otherwise.
  SAMPLES_UPLOAD_PAGE_CHANGE = "SAMPLES_UPLOAD_PAGE_CHANGE",

  // User has successfully uploaded new samples
  SAMPLES_UPLOAD_SUCCESS = "SAMPLES_UPLOAD_SUCCESS",

  // User is uploading data that has resulted in a failure
  SAMPLES_UPLOAD_FAILED = "SAMPLES_UPLOAD_FAILED",

  // User is uploading data with a metadata template or is doing manual entry
  UPLOAD_METADATA_TYPE = "UPLOAD_METADATA_TYPE",

  // User downloading data about samples to a file(s)
  // Does not currently address success/failure, but download failures are very
  // rare, so generally safe to not be concerned about that aspect for now.
  SAMPLES_DOWNLOAD_FILE = "SAMPLES_DOWNLOAD_FILE",

  // User is in multiple groups and is changing which group they are acting in.
  ACTIVE_GROUP_CHANGE = "ACTIVE_GROUP_CHANGE",

  // User has filtered data on the Samples page
  SAMPLES_FILTER = "SAMPLES_FILTER",
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

// capture how the user is uploading or entering metadata
export type UploadFormMetadataType = "BOTH" | "MANUAL" | "TSV";

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
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
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
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
  // Lineages selected for tree creation. json stringified list of strings.
  // "[]" indicates "All lineages"
  selected_lineages: JsonString;
  // Time range filter for tree creation. A null value indicates that
  // the user did not change the default value and there is
  // no start date set. FormattedDateType is "YYYY-MM-DD"
  start_date: FormattedDateType | null;
  // Time range filter for tree creation. A null value indicates that
  // the user did not change the default value and there is
  // no end date set. FormattedDateType is "YYYY-MM-DD"
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
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
  // PK of the workflow that kicked off the creation of this tree.
  // Should never be null, but TS for underlying item does not guarantee it, so
  // the null possibility is mostly to keep TS happy. If null, app has a bug.
  phylo_run_workflow_id: number | null;
  // User can download tree with samples using either their Private IDs or
  // their Public IDs.
  sample_id_type: "PRIVATE" | "PUBLIC";
};

/** EVENT_TYPES.TREE_DETAILS_VIEW */
export type AnalyticsTreeDetailsView = {
  tree_id: number | null;
};

/** EVENT_TYPES.TREE_DOWNLOAD_SELECTED_SAMPLES_TEMPLATE */
export type AnalyticsTreeDownloadSelectedSamplesTemplate = {
  // Tree user is downloading template in regards to.
  // Can download template before tree done or tree failed. Null indicates such
  tree_id: number | null;
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
  // PK of the workflow that kicked off the creation of this tree.
  // Should never be null, but TS for underlying item does not guarantee it, so
  // the null possibility is mostly to keep TS happy. If null, app has a bug.
  phylo_run_workflow_id: number | null;
};

/** EVENT_TYPES.SAMPLES_UPLOAD_PAGE_CHANGE*/
export type AnalyticsSamplesUploadPageChange = {
  // The Samples Upload route user has just come from. If user is entering a
  // new Upload process with this event, this will be empty string.
  prev_route: string;
  // The Samples Upload route user has just gone to.
  new_route: string;
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
  // Random ID generated at start of a given Samples Upload process.
  // This allows us to correlate all the steps in a single Upload process into
  // a unified "flow". If a new Upload is started in same browser session, this
  // will be re-generated, so distinct Upload "flows" will have distinct IDs.
  upload_flow_uuid: string;
};

/** EVENT_TYPES.UPLOAD_METADATA_TYPE */
export type AnalyticsUploadMetadataType = {
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
  // The type of metadata the user is uploading
  metadata_entry_type: UploadFormMetadataType;
  // See above docs on `AnalyticsSamplesUploadPageChange.upload_flow_uuid`.
  // For an Upload "flow" that ends in successful or failed upload, this will match up.
  upload_flow_uuid: string;
  // number of samples in the upload
  sample_count: number;
};

/** EVENT_TYPES.SAMPLES_UPLOAD_SUCCESS*/
export type AnalyticsSamplesUploadSuccess = {
  // How many samples the user just uploaded
  sample_count: number;
  // JSON array of all the IDs for newly created samples for this upload
  sample_ids: JsonString;
  // See above docs on `AnalyticsSamplesUploadPageChange.upload_flow_uuid`.
  // For an Upload "flow" that ends in successful or failed upload, this will match up.
  upload_flow_uuid: string;
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
};

/** EVENT_TYPES.SAMPLES_UPLOAD_FAILED */
export type AnalyticsSamplesUploadFailed = {
  // What was the error message for the failed upload
  failed_message: string;
  // See above docs on `AnalyticsSamplesUploadPageChange.upload_flow_uuid`.
  // For an Upload "flow" that ends in successful or failed upload, this will match up.
  upload_flow_uuid: string;
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
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
  // User downloaded nextclade data for these samples (TSV)
  includes_nextclade_data: boolean;
  // User downloaded info on metadata for these samples
  includes_sample_metadata: boolean;
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
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

/** EVENT_TYPES.SAMPLES_FILTER */
export type AnalyticsSamplesFilter = {
  // User is filtering by uploadDate
  filtering_by_upload_date: boolean;
  // User is filtering by collectionDate
  filtering_by_collection_date: boolean;
  // User is filtering by lineage
  filtering_by_lineage: boolean;
  // User is filtering by qcStatus
  filtering_by_qc_status: boolean;
  // Upload dates that user is filtering on
  upload_date_start: FormattedDateType | null;
  upload_date_end: FormattedDateType | null;
  // Collection dates that user is filtering on
  collection_date_start: FormattedDateType | null;
  collection_date_end: FormattedDateType | null;
  // JSON array of all the lineages user is filtering on
  lineages: JsonString;
  // JSON array of all the qc statuses that user is filtering on
  qc_statuses: JsonString;
  // The current pathogen. For example, "SC2" or "MPX".
  pathogen: Pathogen;
};
