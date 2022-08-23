import { Button, Icon, InputText, Link } from "czifui";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { H1, H2, P } from "src/common/styles/basicStyle";
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

const UNSAVED_CHANGES_MESSAGE = "Leave?"; // TODO: fill in text

export default function Account(): JSX.Element {
  const router = useRouter();
  // TODO:194969 - get user's current gisaid id for the default value
  const [gisaidId, setGisaidId] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // TODO: 194969 - implement save once API is ready
  const handleSave = () => {
    // eslint-disable-next-line
    console.log(gisaidId);
    setHasUnsavedChanges(false);
  };

  const handleNewIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGisaidId(value);
    setHasUnsavedChanges(true);
  };

  // prompt the user if they try and leave with unsaved changes
  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;

      /**
       * (ehoops): The custom message doesn't work, but we still need to
       * assign returnValue for prompt to happen - same as upload page
       * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
       */
      e.preventDefault();
      e.returnValue = UNSAVED_CHANGES_MESSAGE;
      return UNSAVED_CHANGES_MESSAGE;
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (!hasUnsavedChanges) return;

      if (window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        return;
      } else {
        router.events.emit("routeChangeError");
        throw "routeChange aborted.";
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router.events, hasUnsavedChanges]);

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
    </>
  );
}
