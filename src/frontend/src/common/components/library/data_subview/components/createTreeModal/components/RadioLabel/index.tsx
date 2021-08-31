// eslint-disable @typescript-eslint/explicit-member-accessibility
import ListItemText from "@material-ui/core/ListItemText";
import { List } from "czifui";
import React from "react";
import {
  Label,
  LabelLight,
  LabelMain,
  SmallText,
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
    <div>
      <Label>
        <LabelMain>My county and other regions </LabelMain>
        <LabelLight>— Recommended</LabelLight>
      </Label>
      {selected && (
        <List>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconCheckSmall />
            </StyledListItemIcon>
            <ListItemText>
              <SmallText>Best for local outbreak investigation.</SmallText>
            </ListItemText>
          </StyledListItem>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconCheckSmall />
            </StyledListItemIcon>
            <ListItemText>
              <SmallText>
                Best for seeing relationships between your selected samples,
                other samples you have uploaded to Aspen, and publicly-available
                samples on GISAID.
              </SmallText>
            </ListItemText>
          </StyledListItem>
        </List>
      )}
    </div>
  );
};

export const RadioLabelLocal = ({ selected }: Props): JSX.Element => {
  return (
    <div>
      <Label>
        <LabelMain>My county only </LabelMain>
      </Label>
      {selected && (
        <List>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconCheckSmall />
            </StyledListItemIcon>
            <ListItemText>
              <SmallText>
                Useful for seeing viral diversity in your county that may not be
                captured by your own sampling effort.
              </SmallText>
            </ListItemText>
          </StyledListItem>
          <StyledListItem button={false as any}>
            <StyledListItemIcon>
              <StyledIconXSmall />
            </StyledListItemIcon>
            <ListItemText>
              <SmallText>
                Not recommended for epidemiological interpretation due to lack
                of visibility into viral diversity outside of your county and
                omission of closely-related samples.
              </SmallText>
            </ListItemText>
          </StyledListItem>
        </List>
      )}
    </div>
  );
};
