// eslint-disable @typescript-eslint/explicit-member-accessibility
import ListItemText from "@mui/material/ListItemText";
import { useTreatments } from "@splitsoftware/splitio-react";
import { Icon, List } from "czifui";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { ResetFiltersType } from "../..";
import { SampleFiltering } from "../SampleFiltering";
import {
  EndDateFilterType,
  StartDateFilterType,
} from "../SampleFiltering/components/CollectionDateFilter";
import { LineageFilterType } from "../SampleFiltering/components/LineageFilter";
import { LocationFilterType } from "../SampleFiltering/components/LocationFilter";
import { TargetedFiltering } from "../TargetedFiltering";
import { pathogenStrings, tempLocationFilterCopyUpdates } from "./strings";
import {
  Label,
  LabelMain,
  SmallText,
  StyledList,
  StyledListItem,
  StyledListItemCloseIcon,
  StyledListItemIcon,
} from "./style";

interface BaseTreeChoiceProps {
  selected: boolean;
}

interface TreeChoiceWithFilteringProps
  extends BaseTreeChoiceProps,
    StartDateFilterType,
    EndDateFilterType,
    LineageFilterType,
    LocationFilterType,
    ResetFiltersType {}

export const RadioLabelOverview = ({
  selected,
  availableLineages,
  namedLocations,
  selectedLineages,
  selectedLocation,
  setSelectedLineages,
  setSelectedLocation,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isFilterEnabled,
  resetFilters,
}: TreeChoiceWithFilteringProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);

  const flag = useTreatments([USER_FEATURE_FLAGS.tree_location_filter]);
  const isTreeLocationFilterFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.tree_location_filter
  );

  // While the feature flag is in use, merge the updated strings with the originals.
  // When we remove the feature flag, remove this variable
  const tempPathogenStringsWithCopyUpdates =
    isTreeLocationFilterFlagOn && pathogen
      ? { ...pathogenStrings[pathogen], ...tempLocationFilterCopyUpdates }
      : pathogenStrings[pathogen];

  const {
    overviewDescription = "",
    overviewBestFor = "",
    overviewGoodFor1 = "",
    overviewGoodFor2 = "",
    // When we remove the feature flag, change this line back to use pathogenStrings[pathogen]
  } = pathogen ? tempPathogenStringsWithCopyUpdates : {};

  return (
    <div>
      <Label>
        <LabelMain>Overview </LabelMain>
      </Label>

      <SmallText>{overviewDescription}</SmallText>
      {selected && (
        <>
          <StyledList>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{overviewBestFor}</SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{overviewGoodFor1}</SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{overviewGoodFor2}</SmallText>
              </ListItemText>
            </StyledListItem>
          </StyledList>
          <SampleFiltering
            availableLineages={availableLineages}
            namedLocations={namedLocations}
            selectedLineages={selectedLineages}
            selectedLocation={selectedLocation}
            setSelectedLineages={setSelectedLineages}
            setSelectedLocation={setSelectedLocation}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            isFilterEnabled={isFilterEnabled}
            resetFilters={resetFilters}
          />
        </>
      )}
    </div>
  );
};

interface RadioLabelTargetedProps
  extends BaseTreeChoiceProps,
    LocationFilterType,
    ResetFiltersType {}

export const RadioLabelTargeted = ({
  selected,
  namedLocations,
  selectedLocation,
  setSelectedLocation,
  isFilterEnabled,
  resetFilters,
}: RadioLabelTargetedProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);

  const flag = useTreatments([USER_FEATURE_FLAGS.tree_location_filter]);
  const isTreeLocationFilterFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.tree_location_filter
  );

  // While the feature flag is in use, merge the updated strings with the originals.
  // When we remove the feature flag, remove this variable
  const tempPathogenStringsWithCopyUpdates =
    isTreeLocationFilterFlagOn && pathogen
      ? { ...pathogenStrings[pathogen], ...tempLocationFilterCopyUpdates }
      : pathogenStrings[pathogen];

  const {
    targetedDescription = "",
    targetedBestFor = "",
    targetedGoodFor = "",
    // When we remove the feature flag, change this line back to use pathogenStrings[pathogen]
  } = pathogen ? tempPathogenStringsWithCopyUpdates : {};

  return (
    <div>
      <Label>
        <LabelMain>Targeted </LabelMain>
      </Label>
      <SmallText>{targetedDescription}</SmallText>
      {selected && (
        <>
          <List>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{targetedBestFor}</SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{targetedGoodFor}</SmallText>
              </ListItemText>
            </StyledListItem>
          </List>
          {isTreeLocationFilterFlagOn && (
            <TargetedFiltering
              namedLocations={namedLocations}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              isFilterEnabled={isFilterEnabled}
              resetFilters={resetFilters}
            />
          )}
        </>
      )}
    </div>
  );
};

export const RadioLabelNonContextualized = ({
  selected,
  availableLineages,
  selectedLineages,
  setSelectedLineages,
  namedLocations,
  selectedLocation,
  setSelectedLocation,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isFilterEnabled,
  resetFilters,
}: TreeChoiceWithFilteringProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);

  const flag = useTreatments([USER_FEATURE_FLAGS.tree_location_filter]);
  const isTreeLocationFilterFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.tree_location_filter
  );

  // While the feature flag is in use, merge the updated strings with the originals.
  // When we remove the feature flag, remove this variable
  const tempPathogenStringsWithCopyUpdates =
    isTreeLocationFilterFlagOn && pathogen
      ? { ...pathogenStrings[pathogen], ...tempLocationFilterCopyUpdates }
      : pathogenStrings[pathogen];

  const {
    nonContextualizedDescription = "",
    nonContextualizedBestFor = "",
    nonContextualizedGoodFor = "",
    nonContextualizedNotRecommended = "",
    // When we remove the feature flag, change this line back to use pathogenStrings[pathogen]
  } = pathogen ? tempPathogenStringsWithCopyUpdates : {};

  return (
    <div>
      <Label>
        <LabelMain>Non-Contextualized </LabelMain>
      </Label>
      <SmallText>{nonContextualizedDescription}</SmallText>
      {selected && (
        <>
          <List>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{nonContextualizedBestFor}</SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>{nonContextualizedGoodFor}</SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemCloseIcon>
                <Icon sdsIcon="xMark" sdsSize="xs" sdsType="static" />
              </StyledListItemCloseIcon>
              <ListItemText>
                <SmallText>{nonContextualizedNotRecommended}</SmallText>
              </ListItemText>
            </StyledListItem>
          </List>
          <SampleFiltering
            availableLineages={availableLineages}
            selectedLineages={selectedLineages}
            setSelectedLineages={setSelectedLineages}
            namedLocations={namedLocations}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            isFilterEnabled={isFilterEnabled}
            resetFilters={resetFilters}
          />
        </>
      )}
    </div>
  );
};
