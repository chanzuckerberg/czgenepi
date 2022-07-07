/**
 * Canonical list of all the various event types we track with analytics.
 *
 * This exists to ensure consistency/clarity across types and to provide
 * a reference for data analysts working on CZ GE.
 *
 * - Each event type should have a plain-English description of what it means.
 * - Event types should be written in SCREAMING_SNAKE_CASE
 * - Each entry in the enum should be a duplicate key/value string enum
 */
export enum EVENT_TYPES {
  // User has been sent to Nextstrain to view a phylo tree
  TREE_VIEW_NEXTSTRAIN = "TREE_VIEW_NEXTSTRAIN",
}
