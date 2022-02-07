import { List, ListItem } from "czifui";
import React, { useEffect, useState } from "react";
import {
  CapsSizeType,
  HeaderWrapper,
  InstructionsTitle,
  InstructionsWrapper,
  SizeType,
  StyledInstructionsButton,
} from "./style";

interface Props {
  buttonSize?: CapsSizeType;
  header: string;
  headerSize?: SizeType;
  instructionListTitle?: string;
  items: React.ReactNode[];
  listPadding?: SizeType;
  ordered?: boolean;
  shouldStartOpen?: boolean;
  isCollapsible?: boolean;
}

const Instructions = ({
  buttonSize = "xxxs",
  header,
  headerSize = "xs",
  instructionListTitle,
  items,
  listPadding = "l",
  ordered,
  shouldStartOpen = false,
  isCollapsible = true,
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

  console.log("should show instructions: ", shouldStartOpen);

  return (
    <>
      <HeaderWrapper headerSize={headerSize}>
        {header}
        {isCollapsible && CollapsibleInstructionsButton}
      </HeaderWrapper>
      {shouldShowInstructions && (
        <InstructionsWrapper listPadding={listPadding}>
          {instructionListTitle && (
            <InstructionsTitle>{instructionListTitle}</InstructionsTitle>
          )}
          <List ordered={ordered}>
            {items.map((item, index) => {
              return (
                <ListItem fontSize="s" key={index} ordered={ordered}>
                  {item}
                </ListItem>
              );
            })}
          </List>
        </InstructionsWrapper>
      )}
    </>
  );
};

export { Instructions };
