import { useTreatments } from "@splitsoftware/splitio-react";
import { Button, Icon } from "czifui";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { ResetFiltersType } from "../..";
import { StyledTooltip } from "../../style";
import { SampleFilteringTooltip } from "../SampleFilteringTooltip";
import {
  CollectionDateFilter,
  EndDateFilterType,
  StartDateFilterType,
} from "./components/CollectionDateFilter";
import { LineageFilter, LineageFilterType } from "./components/LineageFilter";
import {
  LocationFilter,
  LocationFilterType,
} from "./components/LocationFilter";
import {
  StyledContainer,
  StyledExplainerTitle,
  StyledFiltersSection,
  StyledInfoIconWrapper,
  StyledNewTabLink,
  StyledTitleContainer,
} from "./style";

interface Props
  extends StartDateFilterType,
    EndDateFilterType,
    LineageFilterType,
    LocationFilterType,
    ResetFiltersType {}

const SAMPLE_FILTERING_TOOLTIP_TEXT = (
  <div>
    Samples already selected on the sample table or included by ID in the box
    below will still be force-included on your tree.{" "}
    <StyledNewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit#heading=h.lmtbntly6tx9">
      Learn More
    </StyledNewTabLink>
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
 */
export function SampleFiltering({
  availableLineages,
  isFilterEnabled,
  namedLocations,
  resetFilters,
  selectedLineages,
  selectedLocation,
  setSelectedLineages,
  setSelectedLocation,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: Props): JSX.Element {
  const flag = useTreatments([USER_FEATURE_FLAGS.tree_location_filter]);
  const isTreeLocationFilterFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.tree_location_filter
  );
  return (
    <StyledContainer>
      <StyledTitleContainer>
        <StyledExplainerTitle>
          {isTreeLocationFilterFlagOn
            ? "Define samples of interest by:"
            : "Limit samples from my jurisdiction to:"}
          {isTreeLocationFilterFlagOn ? (
            <SampleFilteringTooltip />
          ) : (
            <StyledTooltip
              arrow
              leaveDelay={1000}
              title={SAMPLE_FILTERING_TOOLTIP_TEXT}
              placement="top"
            >
              <StyledInfoIconWrapper>
                <Icon sdsIcon="infoCircle" sdsSize="xs" sdsType="static" />
              </StyledInfoIconWrapper>
            </StyledTooltip>
          )}
        </StyledExplainerTitle>
        {isTreeLocationFilterFlagOn && isFilterEnabled && (
          <Button
            onClick={resetFilters}
            sdsType="primary"
            sdsStyle="minimal"
            isAllCap
          >
            Reset all
          </Button>
        )}
      </StyledTitleContainer>
      <StyledFiltersSection>
        <LineageFilter
          availableLineages={availableLineages}
          selectedLineages={selectedLineages}
          setSelectedLineages={setSelectedLineages}
        />
        <CollectionDateFilter
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        {isTreeLocationFilterFlagOn && (
          <LocationFilter
            namedLocations={namedLocations}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        )}
      </StyledFiltersSection>
    </StyledContainer>
  );
}
