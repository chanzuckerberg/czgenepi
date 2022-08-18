// eslint-disable @typescript-eslint/explicit-member-accessibility
import ListItemText from "@mui/material/ListItemText";
import { Icon, List } from "czifui";
import { SampleFiltering } from "../SampleFiltering";
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
  return (
    <div>
      <Label>
        <LabelMain>Overview </LabelMain>
      </Label>
      <SmallText>
        Includes samples from both within and outside of your jurisdiction, at a
        ratio of roughly 2:1.
      </SmallText>
      {selected && (
        <>
          <StyledList>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>
                  Best for generating a summary tree of samples from your
                  jurisdiction, in the context of genetically similar GISAID
                  samples from outside of your jurisdiction.
                </SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>
                  Good for identifying possible local outbreaks.
                </SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>
                  Good for specifying lineage or collection date range to
                  customize samples from your jurisdiction.
                </SmallText>
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
  return (
    <div>
      <Label>
        <LabelMain>Targeted </LabelMain>
      </Label>
      <SmallText>
        Includes selected samples and samples that are closely related to the
        selected samples, at a ratio of roughly 1:2.
      </SmallText>
      {selected && (
        <List>
          <StyledListItem>
            <StyledListItemIcon>
              <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
            </StyledListItemIcon>
            <ListItemText>
              <SmallText>
                Best for investigating an identified outbreak.
              </SmallText>
            </ListItemText>
          </StyledListItem>
          <StyledListItem>
            <StyledListItemIcon>
              <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
            </StyledListItemIcon>
            <ListItemText>
              <SmallText>
                Good for identifying samples most closely related to the
                selected samples among all samples in GISAID and your CZ GEN EPI
                samples.
              </SmallText>
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
  return (
    <div>
      <Label>
        <LabelMain>Non-Contextualized </LabelMain>
      </Label>
      <SmallText>
        Includes samples from only your jurisdiction from both CZ GEN EPI and
        GISAID.
      </SmallText>
      {selected && (
        <>
          <List>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>
                  Best for uncovering sampling bias in your own sampling effort.
                </SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon>
                <Icon sdsIcon="check" sdsSize="xs" sdsType="static" />
              </StyledListItemIcon>
              <ListItemText>
                <SmallText>
                  Good for seeing viral diversity in your jurisdiction that may
                  not be captured by your own sampling effort.
                </SmallText>
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemCloseIcon>
                <Icon sdsIcon="xMark" sdsSize="xs" sdsType="static" />
              </StyledListItemCloseIcon>
              <ListItemText>
                <SmallText>
                  Not recommended for epidemiological interpretation due to lack
                  of visibility into viral diversity outside of your
                  jurisdiction and omission of closely-related samples.
                </SmallText>
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
