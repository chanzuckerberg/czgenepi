// eslint-disable @typescript-eslint/explicit-member-accessibility
import ListItemText from "@mui/material/ListItemText";
import { Icon, List } from "czifui";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { SampleFiltering } from "../SampleFiltering";
import { pathogenStrings } from "./strings";
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

interface TreeChoiceWithFilteringProps extends BaseTreeChoiceProps {
  availableLineages: string[];
  selectedLineages: string[];
  setSelectedLineages: (lineages: string[]) => void;
  startDate: FormattedDateType;
  endDate: FormattedDateType;
  setStartDate(d: FormattedDateType): void;
  setEndDate(d: FormattedDateType): void;
}

export const RadioLabelOverview = ({
  selected,
  availableLineages,
  selectedLineages,
  setSelectedLineages,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: TreeChoiceWithFilteringProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);
  const {
    overviewDescription = "",
    overviewBestFor = "",
    overviewGoodFor1 = "",
    overviewGoodFor2 = "",
  } = pathogen ? pathogenStrings[pathogen] : {};

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
            selectedLineages={selectedLineages}
            setSelectedLineages={setSelectedLineages}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </>
      )}
    </div>
  );
};

export const RadioLabelTargeted = ({
  selected,
}: BaseTreeChoiceProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);
  const {
    targetedDescription = "",
    targetedBestFor = "",
    targetedGoodFor = "",
  } = pathogen ? pathogenStrings[pathogen] : {};

  return (
    <div>
      <Label>
        <LabelMain>Targeted </LabelMain>
      </Label>
      <SmallText>{targetedDescription}</SmallText>
      {selected && (
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
      )}
    </div>
  );
};

export const RadioLabelNonContextualized = ({
  selected,
  availableLineages,
  selectedLineages,
  setSelectedLineages,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: TreeChoiceWithFilteringProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);
  const {
    nonContextualizedDescription = "",
    nonContextualizedBestFor = "",
    nonContextualizedGoodFor = "",
    nonContextualizedNotRecommended = "",
  } = pathogen ? pathogenStrings[pathogen] : {};
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
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </>
      )}
    </div>
  );
};
