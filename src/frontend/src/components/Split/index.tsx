/**
 * Everything surrounding the use of Split.io / feature flags lives here.
 *
 * For a detailed guide on working with feature flags in Split, see the wiki:
 *   "GenEpi -- Feature Flags (Split.io) -- HowTo"
 *   https://czi.atlassian.net/l/c/oPCs7jYG
 *
 * A "simple" flag -- one we treat as a boolean of "on" or "off" -- should be
 * set to use the treatment value of "on" (true; feature is enabled) or "off"
 * (false; feature is disabled). Note that a treatment could return any string,
 * this is just what Split defaults to naming treatments and a team convention
 * we follow. Flags can also be even more complex and contain an (optional)
 * `config` object in the flag that we set as custom JSON or key-value pairs.
 *
 * In general we focus just on the simple kind of "on"/"off" flag, since
 * that's where most of usage has been previously. All the helper funcs here
 * are built around that assumption: if you need to work with a complex flag,
 * that's totally fine, but you'll need to write some custom handling.
 *
 * To use a new flag
 *   1) Create the flag in Split, add it to the `FEATURE_FLAGS` enum.
 *      * If it's a simple flag of just "on"/"off", local dev defaults to on
 *   2) To pull the flag in a component in app, do the following
 *        import { useTreatments } from "@splitsoftware/splitio-react";
 *        import { FEATURE_FLAGS } from <<This file right here>>;
 *        const flag = useTreatments([FEATURE_FLAGS.my_flag_name]);
 *   3) If the flag is just a simple "on"/"off" type flag, helper to get bool
 *        << ... in addition what's in (2) above ... >>>
 *        import { isFlagOn } from <<This file right here>>;
 *        const isMyFlagOn = isFlagOn(flag, FEATURE_FLAGS.my_flag_name);
 */
import { SplitFactory } from "@splitsoftware/splitio-react";
import { TreatmentsWithConfig } from "@splitsoftware/splitio/types/splitio";
import { useEffect, useState } from "react";
import ENV from "src/common/constants/ENV";
import { useUserInfo } from "src/common/queries/auth";

/**
 * Canonical listing of all Split feature flags FE needs to know about.
 *
 * If you modify the feature flags while doing dev work, you will need to
 * /reload/ your browser. Do not just depend on the soft [Fast Refresh]
 * functionality of our dev server because the feature flags are injected
 * into the Split config, and that is only rebuilt with a real refresh.
 */
export enum FEATURE_FLAGS {
  // my_flag_name = "my_flag_name", (<-- format example)
  galago_integration = "galago_integration",
  prep_files = "prep_files",
}

// Keyword to tell Split client it's running in local-only mode.
const SPLIT_LOCALHOST_ONLY_MODE = "localhost";
// Team convention for value of an enabled flag that is just a simple on/off.
const SPLIT_SIMPLE_FLAG_ON_VALUE = "on";

/**
 * Creates a `features` object for when Split is running in "localhost" mode.
 *
 * Assumes that all the feature flags in `splitNames` are just simple flags
 * with only an on/off case and that they should all be marked as "on".
 * If a more complex flag is required you should add it separately.
 */
function createSimpleFlagsForLocal(splitNames: Array<FEATURE_FLAGS>) {
  const localFeatures: Partial<Record<FEATURE_FLAGS, string>> = {};
  splitNames.forEach((splitName) => {
    localFeatures[splitName] = SPLIT_SIMPLE_FLAG_ON_VALUE;
  });
  return localFeatures;
}

/**
 * Helper to check if a given Split feature flag is "on" (enabled; true).
 *
 * Note that this function will NOT work on any flag this is using a more
 * complicated set of values than just "on" for enabled. For example, if
 * it's a three-way feature flag, you'll need custom handling.
 *
 * Param of `splitTreatments` being plural is kind of surprising. The reason is
 * Split's `useTreatments` actually takes an array arg and returns an object
 * of all the flags in the array. However, we generally only use a single
 * feature flag at once, so this helper only examines one flag at a time.
 */
export function isFlagOn(
  splitTreatments: TreatmentsWithConfig,
  featureFlagName: string
): boolean {
  const flagValue = splitTreatments[featureFlagName]?.treatment;
  return flagValue === SPLIT_SIMPLE_FLAG_ON_VALUE;
}

interface Props {
  children: React.ReactElement;
}

/**
 * Initializes our Split.io client (what provides feature flags to app).
 *
 * If running in local dev, the `authorizationKey` gets set to "localhost"
 * which tells it to read from its internal `features` object instead of
 * trying to talk to Split servers for feature flags.
 *   https://help.split.io/hc/en-us/articles/360020448791-JavaScript-SDK#localhost-mode
 *
 * If you modify how the config works while doing dev work, you will need to
 * /reload/ your browser. Do not just depend on the soft [Fast Refresh]
 * functionality of our dev server because the config won't be rebuilt.
 */
const SplitInitializer = ({ children }: Props): JSX.Element | null => {
  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo();
  const [splitConfig, setSplitConfig] =
    useState<SplitIO.IBrowserSettings | null>(null);

  useEffect(() => {
    // Don't do any work until we've fetched userInfo
    if (isLoadingUserInfo) {
      return;
    }

    const splitConf: SplitIO.IBrowserSettings = {
      core: {
        authorizationKey: ENV.SPLIT_FRONTEND_KEY,
        key: userInfo?.splitId || "anonymous",
      },
    };
    if (splitConf.core.authorizationKey === SPLIT_LOCALHOST_ONLY_MODE) {
      // Split is only running locally, not talking to its servers.
      // To ease dev experience, we mock flags, setting them all to "on"
      // NOTE: Below just sets /all/ current flags to treatment of "on".
      // If you need some off or a more complicated flag, modify the below.
      const flagsToSetOn = Object.values(FEATURE_FLAGS);
      const mockedFeatureFlags = createSimpleFlagsForLocal(flagsToSetOn);
      splitConf.features = mockedFeatureFlags;
    }

    setSplitConfig(splitConf);
  }, [isLoadingUserInfo, userInfo]);

  if (!splitConfig) {
    // If we haven't fetched a userinfo response yet, don't enable split.
    return <>{children}</>;
  }

  return <SplitFactory config={splitConfig}>{children}</SplitFactory>;
};

export default SplitInitializer;
