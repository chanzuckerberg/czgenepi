import { useTreatments } from "@splitsoftware/splitio-react";
import { Icon } from "czifui";
import { noop } from "src/common/constants/empty";
import {
  MENU_OPTIONS_COLLECTION_DATE,
  MENU_OPTION_ALL_TIME,
} from "src/components/DateFilterMenu/constants";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { StyledTooltip } from "../../style";
import { SampleFilteringTooltip } from "../SampleFilteringTooltip";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
import { LineageFilter } from "./components/LineageFilter";
import {
  StyledContainer,
  StyledExplainerTitle,
  StyledFilterGroup,
  StyledFilterGroupName,
  StyledFiltersSection,
  StyledInfoIconWrapper,
  StyledNewTabLink,
} from "./style";

interface Props {
  availableLineages: string[];
  availableLocations: NamedGisaidLocation[];
  selectedLineages: string[];
  selectedLocation: NamedGisaidLocation;
  setSelectedLineages: (lineages: string[]) => void;
  setSelectedLocation: (location: NamedGisaidLocation) => void;
  startDate: FormattedDateType;
  endDate: FormattedDateType;
  setStartDate(d: FormattedDateType): void;
  setEndDate(d: FormattedDateType): void;
}

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
  availableLocations,
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
      <StyledFiltersSection>
        <LineageFilter
          availableLineages={availableLineages}
          selectedLineages={selectedLineages}
          setSelectedLineages={setSelectedLineages}
        />
        <StyledFilterGroup>
          <StyledFilterGroupName>Collection Date</StyledFilterGroupName>
          <CollectionDateFilter
            fieldKeyEnd="collectionDateEnd"
            fieldKeyStart="collectionDateStart"
            updateDateFilter={noop}
            menuOptions={[
              ...MENU_OPTIONS_COLLECTION_DATE,
              MENU_OPTION_ALL_TIME,
            ]}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            data-test-id="collection-date"
          />
        </StyledFilterGroup>
        {isTreeLocationFilterFlagOn && (
          <StyledFilterGroup>
            <StyledFilterGroupName>Location</StyledFilterGroupName>
            <div>TODO - Locatin Filter</div>
          </StyledFilterGroup>
        )}
      </StyledFiltersSection>
    </StyledContainer>
  );
}
