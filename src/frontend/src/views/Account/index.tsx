import { Button, Icon, InputText, Link } from "czifui";
import React, { ChangeEvent, useState } from "react";
import { H1, H2, P } from "src/common/styles/basicStyle";
import {
  GrayIcon,
  StyledH3,
  StyledHeaderRow,
  StyledRow,
  StyledSection,
  SubText,
  WhiteIcon,
} from "./style";

enum SAVE_BUTTON_STATE {
  NO_CHANGE = "no change",
  NOT_SAVED = "not saved",
  SAVED = "saved",
}

const getSaveButton = (
  saveButtonState: SAVE_BUTTON_STATE,
  handleSave: React.MouseEventHandler<HTMLButtonElement>
): JSX.Element => {
  /*
      no change
      gray save icon, "Save" text, disabled

      not saved
      white save icon, "Save" text, not disabled

      saved
      gray checkCircle icon, "Saved" text, disabled
  */

  switch (saveButtonState) {
    case SAVE_BUTTON_STATE.NO_CHANGE:
      return (
        <Button
          onClick={handleSave}
          disabled
          sdsStyle="rounded"
          sdsType="primary"
          startIcon={<GrayIcon sdsIcon="save" sdsSize="l" sdsType="static" />}
        >
          Save
        </Button>
      );
    case SAVE_BUTTON_STATE.NOT_SAVED:
      return (
        <Button
          onClick={handleSave}
          sdsStyle="rounded"
          sdsType="primary"
          startIcon={<WhiteIcon sdsIcon="save" sdsSize="l" sdsType="static" />}
        >
          Save
        </Button>
      );
    case SAVE_BUTTON_STATE.SAVED:
      return (
        <Button
          onClick={handleSave}
          disabled
          sdsStyle="rounded"
          sdsType="primary"
          startIcon={
            <GrayIcon sdsIcon="checkCircle" sdsSize="l" sdsType="static" />
          }
        >
          Saved
        </Button>
      );
  }
};

export default function Account(): JSX.Element {
  const [gisaidId, setGisaidId] = useState("");
  const [saveButtonState, setSaveButtonState] = useState<SAVE_BUTTON_STATE>(
    SAVE_BUTTON_STATE.NO_CHANGE
  );

  // TODO: 194969 - implement save once API is ready
  const handleSave = () => {
    // eslint-disable-next-line
    console.log(gisaidId);
    setSaveButtonState(SAVE_BUTTON_STATE.SAVED);
  };

  const handleNewIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGisaidId(value);
    setSaveButtonState(SAVE_BUTTON_STATE.NOT_SAVED);
  };

  return (
    <>
      <StyledHeaderRow>
        <H1>My Account</H1>
        {getSaveButton(saveButtonState, handleSave)}
      </StyledHeaderRow>
      <StyledSection>
        <H2>Details</H2>
        <StyledRow>
          <StyledH3>GISAID Submitter ID &nbsp;</StyledH3>
          <SubText>Optional</SubText>
        </StyledRow>
        <StyledRow>
          <P>
            Your personal GISAID Submitter ID. This info is used to help prepare
            samples for GISAID submission.
            <span>
              &nbsp;
              <Link>Learn More.</Link>
            </span>
          </P>
        </StyledRow>

        <InputText
          id="gisaid-id-input"
          aria-label="GISAID ID"
          label="GISAID ID"
          placeholder="GISAID ID"
          hideLabel
          value={gisaidId}
          onChange={handleNewIdInput}
        />
      </StyledSection>
    </>
  );
}
