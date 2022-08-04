import { Button, Icon, InputText, Link } from "czifui";
import React, { ChangeEvent, useState } from "react";
import { H1, H2, P } from "src/common/styles/basicStyle";
import AbandonChangesModal from "./components/AbandonChangesModal";
import {
  GrayIconWrapper,
  StyledDivider,
  StyledH3,
  StyledHeaderRow,
  StyledRow,
  StyledSection,
  SubText,
  WhiteIconWrapper,
} from "./style";

enum SAVE_BUTTON_STATE {
  NOT_SAVED = "not saved",
  SAVED = "saved",
}

export default function Account(): JSX.Element {
  // TODO:194969 - get user's current gisaid id for the default value
  const [gisaidId, setGisaidId] = useState("");
  const [saveButtonState, setSaveButtonState] = useState<SAVE_BUTTON_STATE>(
    SAVE_BUTTON_STATE.SAVED
  );
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

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

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <StyledHeaderRow>
        <H1>My Account</H1>
        <Button
          onClick={handleSave}
          sdsStyle="rounded"
          sdsType="primary"
          disabled={saveButtonState === SAVE_BUTTON_STATE.SAVED}
          startIcon={
            <>
              {saveButtonState === SAVE_BUTTON_STATE.NOT_SAVED ? (
                <WhiteIconWrapper>
                  <Icon sdsIcon="save" sdsSize="l" sdsType="static" />
                </WhiteIconWrapper>
              ) : (
                <GrayIconWrapper>
                  <Icon sdsIcon="checkCircle" sdsSize="l" sdsType="static" />
                </GrayIconWrapper>
              )}
            </>
          }
        >
          {saveButtonState === SAVE_BUTTON_STATE.NOT_SAVED ? "Save" : "Saved"}
        </Button>
      </StyledHeaderRow>
      <StyledDivider />
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
          label="GISAID ID"
          placeholder="GISAID ID"
          hideLabel
          value={gisaidId}
          onChange={handleNewIdInput}
        />
      </StyledSection>
      <AbandonChangesModal open={isModalOpen} onClose={closeModal} />
    </>
  );
}
