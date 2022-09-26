import { forEach } from "lodash";
import { Pathogen } from "src/common/redux/types";
import { PATHOGEN_FEATURE_FLAGS, SPLIT_SIMPLE_FLAG } from "./types";
import { SplitFactory } from "@splitsoftware/splitio";

/**
 * This file contains the configuration for any feature that demonstrates different behavior
 * depending on the current workspace pathogen (traffic type = pathogen, in split parlance).
 * It is used *only* when your app is running locally. When running in any other environment,
 * the config is requested from Split's servers.
 */

type PathogenFlagMap = Record<
  Required<PATHOGEN_FEATURE_FLAGS>,
  Record<Required<Pathogen>, SPLIT_SIMPLE_FLAG>
>;

const pathogenFlagMap: PathogenFlagMap = {
  [PATHOGEN_FEATURE_FLAGS.galago_linkout]: {
    [Pathogen.COVID]: SPLIT_SIMPLE_FLAG.ON,
  },
  [PATHOGEN_FEATURE_FLAGS.lineage_filter_enabled]: {
    [Pathogen.COVID]: SPLIT_SIMPLE_FLAG.ON,
  },
  [PATHOGEN_FEATURE_FLAGS.public_repository]: {
    [Pathogen.COVID]: SPLIT_SIMPLE_FLAG.ON,
  },
  [PATHOGEN_FEATURE_FLAGS.usher_linkout]: {
    [Pathogen.COVID]: SPLIT_SIMPLE_FLAG.ON,
  },
};

/**
 * Creates a `features` object for when Split is running in "localhost" mode.
 *
 * This maps flags with traffic type `pathogen` to the appropriate setting as given in the config.
 * This does not draw from the actual split configuration online -- this is for local use only.
 */
export const createPathogenFlagsForLocal = (pathogen: Pathogen): Record<PATHOGEN_FEATURE_FLAGS, SPLIT_SIMPLE_FLAG> => {
  const localFeatures: Record<PATHOGEN_FEATURE_FLAGS, SPLIT_SIMPLE_FLAG> = {};

  forEach(pathogenFlagMap, (value, key) => {
    const flag = value?.[pathogen];
    localFeatures[key] = flag ?? SPLIT_SIMPLE_FLAG.ON;
  });

  return localFeatures;
};

export const PathogenSplitClient = SplitFactory;
