// eslint-disable @typescript-eslint/explicit-member-accessibility
import ListItemText from "@material-ui/core/ListItemText";
import { List } from "czifui";
import React from "react";
import {
  Label,
  LabelLight,
  LabelMain,
  StyledDiv,
  StyledIconCheckSmall,
  StyledIconXSmall,
  StyledListItem,
  StyledListItemIcon,
} from "./style";

interface Props {
  selected: boolean;
}

export const RadioLabelContextual = ({ selected }: Props): JSX.Element => {
  return (
    <StyledDiv>
      <Label>
        <LabelMain>My county and other regions </LabelMain>
        <LabelLight>- Recommended</LabelLight>
      </Label>
      {selected && (
        <List>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconCheckSmall />
            </StyledListItemIcon>
            <ListItemText>Best for local outbreak investigation.</ListItemText>
          </StyledListItem>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconCheckSmall />
            </StyledListItemIcon>
            <ListItemText>
              Best for seeing relationships between your selected samples, other{" "}
              samples you have uploaded to Aspen, and publicly-available samples
              on GISAID.
            </ListItemText>
          </StyledListItem>
        </List>
      )}
    </StyledDiv>
  );
};

export const RadioLabelLocal = ({ selected }: Props): JSX.Element => {
  return (
    <StyledDiv>
      <LabelMain>My county only </LabelMain>
      {selected && (
        <List>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconCheckSmall />
            </StyledListItemIcon>
            <ListItemText>
              Useful for seeing viral diversity in your county that may not be
              captured by your own sampling effort.
            </ListItemText>
          </StyledListItem>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconXSmall />
            </StyledListItemIcon>
            <ListItemText>
              Not recommended for epidemiological interpretation due to lack of
              visibility into viral diversity outside of your county and
              omission of closely-related samples.
            </ListItemText>
          </StyledListItem>
        </List>
      )}
    </StyledDiv>
  );
};
