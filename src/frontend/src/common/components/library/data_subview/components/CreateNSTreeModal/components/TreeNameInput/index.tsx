import React, { useEffect, useState } from "react";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import {
  StyledTextField,
  TextFieldAlert,
  TreeNameTooLongAlert,
} from "../../style";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
  StyledErrorOutlinedIcon,
} from "./style";

interface Props {
  setTreeName(name: string): void;
  shouldReset?: boolean;
  treeName?: string;
}

const TreeNameInput = ({
  setTreeName,
  shouldReset,
  treeName,
}: Props): JSX.Element => {
  const [isTreeNameTooLong, setTreeNameTooLong] = useState<boolean>(false);

  // form closed or cleared
  useEffect(() => {
    if (shouldReset) {
      setTreeNameTooLong(false);
    }
  }, [shouldReset]);

  // show name errors
  useEffect(() => {
    const isNameTooLong = (treeName?.length ?? 0) > 128;
    setTreeNameTooLong(isNameTooLong);
  }, [treeName]);

  return (
    <div>
      <CollapsibleInstructions
        header="Tree Name"
        items={[
          <InstructionsSemiBold key="1">
            Do not include any PII in your Tree name.
          </InstructionsSemiBold>,
          <InstructionsNotSemiBold key="2">
            Tree names must be no longer than 128 characters.
          </InstructionsNotSemiBold>,
        ]}
        shouldStartOpen={false}
      />
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
