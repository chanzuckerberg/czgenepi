import { List, ListItem } from "czifui";
import React, { useState } from "react";
import {
  CapsSizeType,
  HeaderWrapper,
  InstructionsTitle,
  InstructionsWrapper,
  SecondInstructionsTitle,
  SizeType,
  StyledInstructionsButton,
  FontBodySizeType
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
  InstructionsTitleMarginBottom,
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
      color="primary"
      onClick={handleInstructionsClick}
    >
      {shouldShowInstructions ? "LESS" : "MORE"} INFO
    </StyledInstructionsButton>
  );

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
          <List ordered={ordered}>
            {items.map((item, index) => {
              return (
                <ListItem
                  fontSize={listItemFontSize}
                  key={index}
                  ordered={ordered}
                >
                  {item}
                </ListItem>
              );
            })}
          </List>
          {secondInstructionListTitle && (
            <SecondInstructionsTitle
              headerSize={headerSize}
              marginBottom={InstructionsTitleMarginBottom}
            >
              {secondInstructionListTitle}
            </SecondInstructionsTitle>
          )}
          {secondSetItems && (
            <List ordered={ordered}>
              {secondSetItems.map((item, index) => {
                return (
                  <ListItem
                    fontSize={listItemFontSize}
                    key={index}
                    ordered={ordered}
                  >
                    {item}
                  </ListItem>
                );
              })}
            </List>
          )}
        </InstructionsWrapper>
      )}
    </>
  );
};

export { CollapsibleInstructions };
