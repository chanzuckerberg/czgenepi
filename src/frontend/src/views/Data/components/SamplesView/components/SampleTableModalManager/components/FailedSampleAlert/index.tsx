import { pluralize } from "src/common/utils/strUtils";
import { SemiBold, StyledCallout } from "./style";

interface Props {
  numFailedSamples: number;
}

const FailedSampleAlert = ({ numFailedSamples }: Props): JSX.Element | null => {
  if (numFailedSamples <= 0) return null;

  return (
    <StyledCallout intent="warning">
      <SemiBold>
        {" "}
        {numFailedSamples} Selected {pluralize("Sample", numFailedSamples)}
        {" won't "}
        be included in your tree{" "}
      </SemiBold>
      because they failed genome recovery.
    </StyledCallout>
  );
};

export { FailedSampleAlert };
