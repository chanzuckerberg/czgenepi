import React, { useEffect, useState } from "react";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import Instructions from "src/components/Instructions";
import {
  StyledTextField,
  TextFieldAlert,
  TreeNameTooLongAlert,
} from "../../style";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
  StyledErrorOutlinedIcon,
  TextInputLabelTitle,
} from "./style";

interface Props {
  setTreeName(name: string): void;
  shouldReset?: boolean;
  treeName?: string;
  withCollapsibleInstructions?: boolean; // in edit tree modal we want instructions to always show
  instructionHeader?: string;
  textInputLabel?: string;
  isTextInputMultiLine?: boolean;
}

const TreeNameInput = ({
  setTreeName,
  shouldReset,
  treeName,
  instructionHeader,
  textInputLabel,
  withCollapsibleInstructions = true,
  isTextInputMultiLine = false,
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

  console.log("tree name: ", treeName);

  const header = instructionHeader ? instructionHeader : "";
  const items = [
    <InstructionsSemiBold key="1">
      Do not include any PII in your Tree name.
    </InstructionsSemiBold>,
    <InstructionsNotSemiBold key="2">
      Tree names must be no longer than 128 characters.
    </InstructionsNotSemiBold>,
  ];

  const instructions = withCollapsibleInstructions ? (
    // in create Tree Dialog the instructions are collapsible and start closed
    // in edit Tree Dialog the instructions are not collapsible, and therefor should start open
    <CollapsibleInstructions
      header={header}
      items={items}
      instructionListTitle={"Instructions"}
    />
  ) : (
    <Instructions items={items} title={"Instructions"} />
  );

  return (
    <div>
      {instructions}
      {textInputLabel && (
        <TextInputLabelTitle>{textInputLabel}</TextInputLabelTitle>
      )}
      <StyledTextField
        fullWidth
        error={isTreeNameTooLong}
        id="outlined-basic"
        variant="outlined"
        value={treeName}
        size="small"
        onChange={(e) => setTreeName(e.target.value)}
        multiline={isTextInputMultiLine ? true : false}
        maxRows={isTextInputMultiLine ? 3 : undefined}
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
