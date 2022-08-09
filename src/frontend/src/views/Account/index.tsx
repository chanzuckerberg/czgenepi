import { Button, Icon, InputText, Link } from "czifui";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
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

export default function Account(): JSX.Element {
  const router = useRouter();
  // TODO:194969 - get user's current gisaid id for the default value
  const [gisaidId, setGisaidId] = useState("");
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  // TODO: 194969 - implement save once API is ready
  const handleSave = () => {
    // eslint-disable-next-line
    console.log(gisaidId);
    setUnsavedChanges(false);
  };

  const handleNewIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGisaidId(value);
    setUnsavedChanges(true);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // prompt the user if they try and leave with unsaved changes
  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      openModal();
      return false;
    };
    const handleBrowseAway = () => {
      if (!hasUnsavedChanges) return;
      openModal();
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };
    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [router, hasUnsavedChanges]);

  return (
    <>
      <StyledHeaderRow>
        <H1>My Account</H1>
        <Button
          onClick={handleSave}
          sdsStyle="rounded"
          sdsType="primary"
          disabled={!hasUnsavedChanges}
          startIcon={
            <>
              {hasUnsavedChanges ? (
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
          {hasUnsavedChanges ? "Save" : "Saved"}
        </Button>
      </StyledHeaderRow>
      <StyledDivider />
      <StyledSection>
        <H2>Details</H2>
        <StyledRow>
          <StyledH3>GISAID Submitter ID</StyledH3>
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
      {isModalOpen && (
        <AbandonChangesModal open={isModalOpen} onClose={closeModal} />
      )}
    </>
  );
}
