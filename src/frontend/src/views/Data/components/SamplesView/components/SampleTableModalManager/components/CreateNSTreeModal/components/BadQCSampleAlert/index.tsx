import { pluralize } from "src/common/utils/strUtils";
import { SemiBold, StyledCallout } from "./style";

interface Props {
  numBadQCSamples: number;
}

const BadQCSampleAlert = ({ numBadQCSamples }: Props): JSX.Element | null => {
  if (numBadQCSamples <= 0) return null;

  return (
    <StyledCallout intent="warning">
      <SemiBold>
        {" "}
        {numBadQCSamples} Selected {pluralize("Sample", numBadQCSamples)} have a
        QC status of {"bad"},{" "}
      </SemiBold>
      which means that their placement in the phylogenetic tree will be less
      reliable.
    </StyledCallout>
  );
};

export { BadQCSampleAlert };
