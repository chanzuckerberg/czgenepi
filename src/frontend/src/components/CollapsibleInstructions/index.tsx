import { List, ListItem } from "czifui";
import { useState } from "react";
import {
  CapsSizeType,
  Divider,
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
  additionalHeaderLink?: JSX.Element;
  header: string;
  headerSize?: SizeType;
  instructionListTitle?: string;
  items: React.ReactNode[];
  secondInstructionListTitle?: string;
  secondSetItems?: React.ReactNode[];
  listPadding?: SizeType;
  ordered?: boolean;
  shouldStartOpen?: boolean;
  instructionsTitleMarginBottom?: SizeType;
  listItemFontSize?: FontBodySizeType;
}

const CollapsibleInstructions = ({
  buttonSize = "xxxs",
  additionalHeaderLink,
  header,
  headerSize = "xs",
  instructionListTitle,
  items,
  secondInstructionListTitle,
  instructionsTitleMarginBottom = "xxs",
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
    <>
      <StyledInstructionsButton
        buttonSize={buttonSize}
        sdsType="primary"
        sdsStyle="minimal"
        onClick={handleInstructionsClick}
      >
        {shouldShowInstructions ? "LESS" : "MORE"} INFO
      </StyledInstructionsButton>
      {additionalHeaderLink && (
        <>
          <Divider>|</Divider>
          {additionalHeaderLink}
        </>
      )}
    </>
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
              marginBottom={instructionsTitleMarginBottom}
            >
              {instructionListTitle}
            </InstructionsTitle>
          )}
          {listItems(items)}
          {secondInstructionListTitle && (
            <SecondInstructionsTitle
              headerSize={headerSize}
              marginBottom={instructionsTitleMarginBottom}
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
