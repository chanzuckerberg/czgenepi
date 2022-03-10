import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { noop } from "src/common/constants/empty";
import { StyledInfoOutlinedIcon, StyledTooltip } from "../../style";
import {
  StyledContainer,
  StyledExplainerTitle,
  StyledFilterGroup,
  StyledFilterGroupName,
  StyledFiltersSection,
  StyledInputDropdown,
} from "./style";

const SAMPLE_FILTERING_TOOLTIP_TEXT = (
  <div>
    Samples already selected on the sample table or included by ID in the box
    below will still be force-included on your tree.{" "}
    <NewTabLink href="https://docs.google.com/document/d/1NhDW42YZQ7DMhPhUOIBWp04n51FO8GItCZPaw7hRtQk/edit?usp=sharing">
      Learn More
    </NewTabLink>
  </div>
);

/**
 * Provides filtering of samples that are automatically added to trees.
 *
 * For tree creation, the user can select samples to create a tree. But that
 * only makes up some of the samples that go into the tree: others are chosen
 * automatically through the tree building process and added. These filters
 * are intended to restrict that second category of samples: those chosen
 * automatically by downstream tree creation. These filters have no impact on
 * the samples explicitly chosen by the user.
 *
 * TODO Vincent -- Mar 9, 2022
 * Below `StyledInputDropdown` components are /very/ much placeholders.
 * Looked over czifui for a bit, and I couldn't find an easy way to match
 * our designs to what's current available. Those are just there to get
 * a version of this out the door, nothing longterm at all there.
 */
export function SampleFiltering() {
  return (
    <StyledContainer>
      <StyledExplainerTitle>
        Limit samples from my jurisdiction to:
        <StyledTooltip
          arrow
          leaveDelay={1000}
          title={SAMPLE_FILTERING_TOOLTIP_TEXT}
          placement="top"
        >
          <StyledInfoOutlinedIcon />
        </StyledTooltip>
      </StyledExplainerTitle>

      <StyledFiltersSection>
        <StyledFilterGroup>
          <StyledFilterGroupName>Lineage</StyledFilterGroupName>
          <StyledInputDropdown
            disabled={false}
            label="Dummy placeholder"
            onClick={noop}
            sdsStage="userInput"
            sdsStyle="square"
          />
        </StyledFilterGroup>
        <StyledFilterGroup>
          <StyledFilterGroupName>Collection Date</StyledFilterGroupName>
          <StyledInputDropdown
            disabled={false}
            label="Dummy placeholder"
            onClick={noop}
            sdsStage="userInput"
            sdsStyle="square"
          />
        </StyledFilterGroup>
      </StyledFiltersSection>
    </StyledContainer>
  );
}
