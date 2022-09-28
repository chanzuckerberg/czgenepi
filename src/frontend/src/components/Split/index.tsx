/**
 * Everything surrounding the use of Split.io / feature flags lives in this directory.
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
 * To use a new flag for `user` traffic type,
 *   1) Create the flag in Split, add it to the `USER_FEATURE_FLAGS` enum.
 *      * If it's a simple flag of just "on"/"off", local dev defaults to on
 *   2) To pull the flag in a component in app, do the following
 *        import { useTreatments } from "@splitsoftware/splitio-react";
 *        import { USER_FEATURE_FLAGS } from <<file in this dir>>;
 *        const flag = useTreatments([USER_FEATURE_FLAGS.my_flag_name]);
 *   3) If the flag is just a simple "on"/"off" type flag, helper to get bool
 *        << ... in addition what's in (2) above ... >>>
 *        import { isFlagOn } from <<This file right here>>;
 *        const isMyFlagOn = isFlagOn(flag, USER_FEATURE_FLAGS.my_flag_name);
 */
import { SplitFactory } from "@splitsoftware/splitio-react";
import { TreatmentsWithConfig } from "@splitsoftware/splitio/types/splitio";
import { useEffect, useState } from "react";
import ENV from "src/common/constants/ENV";
import { useUserInfo } from "src/common/queries/auth";
import { isLocalSplitEnv } from "./util";
import { SPLIT_SIMPLE_FLAG, USER_FEATURE_FLAGS } from "./types";

/**
 * Creates a `features` object for when Split is running in "localhost" mode.
 *
 * Assumes that all the user-based feature flags are just simple flags
 * with only an on/off case and that they should all be marked as "on".
 * If a more complex flag is required you should add it separately.
 */
const createUserFlagsForLocal = () => {
  const simpleFlags: Partial<Record<USER_FEATURE_FLAGS, SPLIT_SIMPLE_FLAG>> = {};

  const features = Object.values(USER_FEATURE_FLAGS);
  features.forEach((feature) => {
    simpleFlags[feature] = SPLIT_SIMPLE_FLAG.ON;
  });

  return simpleFlags;
};

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
// TODO (mlila):figure out if this works with traffictype=pathogen
export function isFlagOn(
  splitTreatments: TreatmentsWithConfig,
  featureFlagName: string
): boolean {
  const flagValue = splitTreatments[featureFlagName]?.treatment;
  return flagValue === SPLIT_SIMPLE_FLAG.ON;
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
        trafficType: "user",
      },
    };
    if (isLocalSplitEnv) {
      const mockedFeatureFlags = createUserFlagsForLocal();
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
