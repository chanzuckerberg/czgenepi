import { pluralize } from "src/common/utils/strUtils";
import { SemiBold, StyledCallout } from "./style";

interface Props {
  numBadOrFailedQCSamples: number;
}

const BadOrFailedQCSampleAlert = ({
  numBadOrFailedQCSamples,
}: Props): JSX.Element | null => {
  if (numBadOrFailedQCSamples <= 0) return null;

  return (
    <StyledCallout intent="warning">
      <SemiBold>
        {" "}
        {numBadOrFailedQCSamples} Selected{" "}
        {pluralize("Sample", numBadOrFailedQCSamples)} have a QC status of
        &quot;bad&quot; or &quot;failed&quot;,{" "}
      </SemiBold>
      which means that their placement in the phylogenetic tree will be less
      reliable.
    </StyledCallout>
  );
};

export { BadOrFailedQCSampleAlert };
