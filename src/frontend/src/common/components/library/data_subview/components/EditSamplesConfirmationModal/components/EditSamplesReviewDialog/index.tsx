import { Checkbox } from "czifui";
import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { ROUTES } from "src/common/routes";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import { Table } from "./components/Table";
import {
  CalloutContainer,
  CheckboxWrapper,
  StyledButton,
  StyledCallout,
  StyledCollapseContent,
  StyledNewTabLink,
} from "./style";

interface Props {
  changedMetaData: any;
  onClickBack(): void;
}

const EditSamplesReviewDialog = ({
  changedMetaData,
  onClickBack,
}: Props): JSX.Element => {
  const numChangedSamples = changedMetaData.length ?? 0;
  const warningTitle = (
    <>
      <B>
        {numChangedSamples} {pluralize("Sample", numChangedSamples)} have
        updated privacy settings,
      </B>{" "}
      which will impact who can see your de-identified sample data. Read our{" "}
      <StyledNewTabLink href={ROUTES.PRIVACY} sdsStyle="dashed">
        Privacy Policy
      </StyledNewTabLink>{" "}
      for more information.
    </>
  );

  const collapseContent = (
    <>
      <StyledCollapseContent>
        <B>Changed Samples (Private ID):</B>
      </StyledCollapseContent>
    </>
  );

  return (
    <>
      <Table />
      <CheckboxWrapper>
        <Checkbox />
        <div>
          I agree that the data I am uploading to CZ GEN EPI has been lawfully
          collected and that I have all the necessary consents, permissions, and
          authorizations needed to collect, share and export data as outlined in
          the <NewTabLink href={ROUTES.TERMS}>Terms</NewTabLink> and{" "}
          <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink>. I have
          reviewed the data that I am uploading and can confirm that I am not
          uploading any personally identifiable information.
        </div>
      </CheckboxWrapper>
      <CalloutContainer>
        <StyledCallout intent="info">
          Once saved, the sample metadata above will overwrite all exisiting
          data. <B>This action cannot be undone.</B>
        </StyledCallout>
        <AlertAccordion
          intent="warning"
          title={warningTitle}
          collapseContent={collapseContent}
        ></AlertAccordion>
      </CalloutContainer>
      <div>
        <StyledButton sdsType="primary" sdsStyle="rounded">
          Save
        </StyledButton>
        <StyledButton
          sdsType="secondary"
          sdsStyle="rounded"
          onClick={onClickBack}
        >
          Back
        </StyledButton>
      </div>
    </>
  );
};

export { EditSamplesReviewDialog };
