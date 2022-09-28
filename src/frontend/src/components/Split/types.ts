/**
 * Team convention for values of an enabled flag that is just a simple on/off.
 */
export enum SPLIT_SIMPLE_FLAG {
  ON = "on",
  OFF = "off",
}

/**
 * Canonical listing of all User-based Split feature flags FE needs to know about.
 * One enum per traffic type (currently, we have `user` and `pathogen` types)
 *
 * If you modify the feature flags while doing dev work, you will need to
 * /reload/ your browser. Do not just depend on the soft [Fast Refresh]
 * functionality of our dev server because the feature flags are injected
 * into the Split config, and that is only rebuilt with a real refresh.
 */
export enum USER_FEATURE_FLAGS {
  // my_flag_name = "my_flag_name", (<-- format example)
  galago_integration = "galago_integration",
  prep_files = "prep_files",
}

/**
 * Canonical listing of all Pathogen-based Split feature flags FE needs to know about.
 * One enum per traffic type (currently, we have `user` and `pathogen` types)
 */
export enum PATHOGEN_FEATURE_FLAGS {
  galago_linkout = "PATHOGEN_galago_linkout",
  lineage_filter_enabled = "PATHOGEN_lineage_filter_enabled",
  public_repository = "PATHOGEN_public_repository",
  usher_linkout = "PATHOGEN_usher_linkout",
}
