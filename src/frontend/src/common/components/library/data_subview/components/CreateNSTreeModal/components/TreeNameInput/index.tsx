import React, { useEffect, useState } from "react";
import {
  FieldTitle,
  StyledTextField,
  TextFieldAlert,
  TreeNameInfoWrapper,
  TreeNameTooLongAlert,
} from "../../style";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
  StyledErrorOutlinedIcon,
  StyledInstructions,
  StyledInstructionsButton,
} from "./style";

interface Props {
  setTreeName(): void;
  shouldReset?: boolean;
  treeName?: string;
}

const TreeNameInput = ({
  setTreeName,
  shouldReset,
  treeName,
}: Props): JSX.Element => {
  const [areInstructionsShown, setInstructionsShown] = useState<boolean>(false);
  const [isTreeNameTooLong, setTreeNameTooLong] = useState<boolean>(false);

  // form closed or cleared
  useEffect(() => {
    if (shouldReset) {
      setInstructionsShown(false);
      setTreeNameTooLong(false);
    }
  }, [shouldReset]);

  // show name errors
  useEffect(() => {
    const isNameTooLong = treeName?.length > 128;
    setTreeNameTooLong(isNameTooLong);
  }, [treeName]);

  // toggle instructions
  const handleInstructionsClick = function () {
    setInstructionsShown((prevState: boolean) => !prevState);
  };

  return (
    <div>
      <TreeNameInfoWrapper>
        <FieldTitle>Tree Name</FieldTitle>
        <StyledInstructionsButton
          color="primary"
          onClick={handleInstructionsClick}
        >
          {/* TODO (mlila): refactor out collapsible instructions into its own component */}
          {areInstructionsShown ? "LESS" : "MORE"} INFO
        </StyledInstructionsButton>
      </TreeNameInfoWrapper>
      {areInstructionsShown && (
        <StyledInstructions
          items={[
            <InstructionsSemiBold key="1">
              Do not include any PII in your Tree name.
            </InstructionsSemiBold>,
            <InstructionsNotSemiBold key="2">
              Tree names must be no longer than 128 characters.
            </InstructionsNotSemiBold>,
          ]}
        />
      )}
      <StyledTextField
        fullWidth
        error={isTreeNameTooLong}
        id="outlined-basic"
        variant="outlined"
        value={treeName}
        size="small"
        onChange={(e) => setTreeName(e.target.value)}
      />
      {isTreeNameTooLong && (
        <TreeNameTooLongAlert>
          <StyledErrorOutlinedIcon />
          <TextFieldAlert>Name exceeds the 128 character limit.</TextFieldAlert>
        </TreeNameTooLongAlert>
      )}
    </div>
  );
};

export { TreeNameInput };
