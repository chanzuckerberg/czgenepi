import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import { SemiBold, StyledList, StyledListItem } from "./style";

interface Props {
  missingSamples: string[];
}

const MissingSampleAlert = ({ missingSamples }: Props): JSX.Element | null => {
  const numMissingSamples = missingSamples.length;
  if (numMissingSamples <= 0) return null;

  const collapseContent = (
    <StyledList>
      {missingSamples.map((sample) => {
        return <StyledListItem key={sample}>{sample}</StyledListItem>;
      })}
    </StyledList>
  );

  const title = (
    <span>
      <SemiBold>
        {numMissingSamples} Sample {pluralize("ID", numMissingSamples)} couldn’t
        be found
      </SemiBold>{" "}
      and will not appear on your tree.
    </span>
  );

  return (
    <AlertAccordion
      collapseContent={collapseContent}
      intent="warning"
      title={title}
    />
  );
};

export { MissingSampleAlert };
