import { List, ListItem } from "czifui";
import React, { useState } from "react";
import {
  CapsSizeType,
  FontBodySizeType,
  HeaderWrapper,
  InstructionsTitle,
  InstructionsWrapper,
  SecondInstructionsTitle,
  SizeType,
  StyledInstructionsButton,
} from "./style";

interface Props {
  buttonSize?: CapsSizeType;
  header: string;
  headerSize?: SizeType;
  instructionListTitle?: string;
  items: React.ReactNode[];
  secondInstructionListTitle?: string;
  secondSetItems?: React.ReactNode[];
  listPadding?: SizeType;
  ordered?: boolean;
  shouldStartOpen?: boolean;
  InstructionsTitleMarginBottom?: SizeType;
  listItemFontSize?: FontBodySizeType;
}

const CollapsibleInstructions = ({
  buttonSize = "xxxs",
  header,
  headerSize = "xs",
  instructionListTitle,
  items,
  secondInstructionListTitle,
  InstructionsTitleMarginBottom = "xxs",
  secondSetItems,
  listPadding = "l",
  listItemFontSize = "s",
  ordered,
  shouldStartOpen = false,
}: Props): JSX.Element => {
  const [shouldShowInstructions, setShowInstructions] =
    useState(shouldStartOpen);

  const handleInstructionsClick = () => {
    setShowInstructions(!shouldShowInstructions);
  };

  const CollapsibleInstructionsButton = (
    <StyledInstructionsButton
      buttonSize={buttonSize}
      sdsType="primary"
      sdsStyle="minimal"
      onClick={handleInstructionsClick}
    >
      {shouldShowInstructions ? "LESS" : "MORE"} INFO
    </StyledInstructionsButton>
  );

  const listItems = (items: React.ReactNode[]): JSX.Element => {
    return (
      <List ordered={ordered}>
        {items.map((item, index) => {
          return (
            <ListItem fontSize={listItemFontSize} key={index} ordered={ordered}>
              {item}
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <>
      <HeaderWrapper headerSize={headerSize}>
        {header}
        {CollapsibleInstructionsButton}
      </HeaderWrapper>
      {shouldShowInstructions && (
        <InstructionsWrapper listPadding={listPadding}>
          {instructionListTitle && (
            <InstructionsTitle
              headerSize={headerSize}
              marginBottom={InstructionsTitleMarginBottom}
            >
              {instructionListTitle}
            </InstructionsTitle>
          )}
          {listItems(items)}
          {secondInstructionListTitle && (
            <SecondInstructionsTitle
              headerSize={headerSize}
              marginBottom={InstructionsTitleMarginBottom}
            >
              {secondInstructionListTitle}
            </SecondInstructionsTitle>
          )}
          {secondSetItems && listItems(secondSetItems)}
        </InstructionsWrapper>
      )}
    </>
  );
};

export { CollapsibleInstructions };
