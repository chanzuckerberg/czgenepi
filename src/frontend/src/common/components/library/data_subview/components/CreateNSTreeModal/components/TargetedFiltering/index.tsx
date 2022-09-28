import { SampleFilteringTooltip } from "../SampleFilteringTooltip";
import { FilterContainer, StyledExplainerTitle } from "./style";

export const TargetedFiltering = (): JSX.Element => {
  return (
    <FilterContainer>
      <StyledExplainerTitle>
        Prefer closely-related samples from (location):
        <SampleFilteringTooltip />
      </StyledExplainerTitle>
      {/* TODO: SC-190388 will add location filter here */}
    </FilterContainer>
  );
};
