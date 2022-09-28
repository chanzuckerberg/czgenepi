import { SplitClient, SplitTreatments } from "@splitsoftware/splitio-react";
import { ReactNode, useEffect, useState } from "react";
import { isLocalSplitEnv } from "./util";
import { createPathogenFlagsForLocal, CurrentPathogenFlagMapping } from "./pathogenSplitConfig";
import { PATHOGEN_FEATURE_FLAGS, SPLIT_SIMPLE_FLAG } from "./types";
import { Pathogen } from "src/common/redux/types";

interface Props {
  children: ReactNode;
  pathogen: Pathogen;
  feature: PATHOGEN_FEATURE_FLAGS;
}

const SplitPathogenWrapper = ({ children, feature, pathogen }: Props): JSX.Element | null => {
  const [localFlags, setLocalFlags] = useState<CurrentPathogenFlagMapping>();

  // if pathogen changes, make sure to update whether pathogen-dependent feature flags
  // are adjusted as well
  useEffect(() => {
    const flags = createPathogenFlagsForLocal(pathogen);
    setLocalFlags(flags);
  }, [pathogen]);

  // if working locally, use local mocked flags to determine what to show or hide.
  if (isLocalSplitEnv) {
    if (localFlags?.[feature] === SPLIT_SIMPLE_FLAG.ON) {
      return <>{children}</>;
    }

    return null;
  }

  // in any non-local environment, use the actual values from split.io to determine which
  // components to show or hide.
  return (
    <SplitClient splitKey={pathogen} trafficType="pathogen">
      <SplitTreatments names={[feature]}>
        {({ isReady, treatments }) => {
          if (isReady) {
            console.log("treatments", treatments); // eslint-disable-line
            const treatment = treatments[feature]?.treatment;
            console.log("treatment", treatment); // eslint-disable-line
            return treatment === SPLIT_SIMPLE_FLAG.ON ? (<div>{children}</div>) : null;
          }

          // wait until treatments are loaded to show anything
          return null;
        }}
      </SplitTreatments>
    </SplitClient>
  );
};

export { SplitPathogenWrapper };
