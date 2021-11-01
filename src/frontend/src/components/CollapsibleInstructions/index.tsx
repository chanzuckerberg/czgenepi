import { List, ListItem } from "czifui";
import React, { useState } from "react";
import { InstructionsProps } from "./components/Instructions";
import {
  HeaderWrapper,
  StyledInstructionsButton,
  Title,
  Wrapper,
} from "./style";

interface Props extends InstructionsProps {
  className?: string;
  header: string;
  instructionListTitle?: string;
  items: React.ReactNode[];
  ordered?: boolean;
  shouldStartOpen: boolean;
}

const CollapsibleInstructions = ({
  className,
  header,
  instructionListTitle,
  items,
  ordered,
  shouldStartOpen = false,
}: Props): JSX.Element => {
  const [shouldShowInstructions, setShowInstructions] =
    useState(shouldStartOpen);

  const handleInstructionsClick = () => {
    setShowInstructions(!shouldShowInstructions);
  };

  return (
    <>
      <HeaderWrapper>
        {header}
        <StyledInstructionsButton
          color="primary"
          onClick={handleInstructionsClick}
        >
          {shouldShowInstructions ? "LESS" : "MORE"} INFO
        </StyledInstructionsButton>
      </HeaderWrapper>
      {shouldShowInstructions && (
        <Wrapper className={className}>
          {instructionListTitle && <Title>{instructionListTitle}</Title>}
          <List ordered={ordered}>
            {items.map((item, index) => {
              return (
                <ListItem fontSize="s" key={index} ordered={ordered}>
                  {item}
                </ListItem>
              );
            })}
          </List>
        </Wrapper>
      )}
    </>
  );
};

export { CollapsibleInstructions };
