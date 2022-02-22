import { SplitFactory } from "@splitsoftware/splitio-react";
import React, { useEffect, useState } from "react";
import ENV from "src/common/constants/ENV";
import { useUserData } from "src/common/queries/auth";

interface Props {
  children: React.ReactElement;
}

/* To use the split client to fetch the value of a feature flag:
 *
 * import { useTreatments } from '@splitsoftware/splitio-react';
 * const MyComponent = (): JSX.Element => {
 *    const flag = useTreatments(["my_flag_name"]);
 *    return (
 *       <div>{flag.my_flag_name.treatment}</div>
 *    )
 *  }
 */

const SplitInitializer = ({ children }: Props): JSX.Element | null => {
  const { data: userData, isLoading: isLoadingUserInfo } = useUserData();
  const [splitConfig, setSplitConfig] =
    useState<SplitIO.IBrowserSettings | null>(null);

  useEffect(() => {
    // Don't do any work until we've fetched userData
    if (isLoadingUserInfo) {
      return;
    }
    const splitConf: SplitIO.IBrowserSettings = {
      core: {
        authorizationKey: ENV.SPLIT_FRONTEND_KEY,
        key: userData?.split_id || "anonymous",
      },
    };
    setSplitConfig(splitConf);
  }, [isLoadingUserInfo, userData]);

  if (!splitConfig) {
    // If we haven't fetched a userinfo response yet, don't enable split.
    return <>{children}</>;
  }

  return <SplitFactory config={splitConfig}>{children}</SplitFactory>;
};

export default SplitInitializer;
