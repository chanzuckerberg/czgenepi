import { Checkbox } from "czifui";
import { filter } from "lodash";
import React, { useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { ROUTES } from "src/common/routes";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import { MetadataType } from "../../index";
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
  changedMetadata: MetadataType;
  onClickBack(): void;
}

const EditSamplesReviewDialog = ({
  changedMetadata,
  onClickBack,
}: Props): JSX.Element => {
  const [isChecked, setChecked] = useState<boolean>(false);

  const privacyChangedSamples = filter(Object.keys(changedMetadata), (key) =>
    Object.hasOwn(changedMetadata[key], "keepPrivate")
  );
  const numPrivacyChanged = privacyChangedSamples.length;

  const warningTitle = (
    <>
      <B>
        {numPrivacyChanged} {pluralize("Sample", numPrivacyChanged)}{" "}
        {pluralize("has", numPrivacyChanged)} updated privacy settings,
      </B>{" "}
      which will impact who can see your de-identified sample data. Read our{" "}
      <StyledNewTabLink href={ROUTES.PRIVACY}>Privacy Policy</StyledNewTabLink>{" "}
      for more information.
    </>
  );

  const collapseContent = (
    <>
      <StyledCollapseContent>
        <B>Changed Samples (Private ID):</B> {privacyChangedSamples.join(", ")}
      </StyledCollapseContent>
    </>
  );

  return (
    <>
      <Table metadata={{}} />
      <CheckboxWrapper>
        <Checkbox
          stage={isChecked ? "checked" : "unchecked"}
          onClick={() => setChecked(!isChecked)}
        />
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
        {numPrivacyChanged > 0 && (
          <AlertAccordion
            intent="warning"
            title={warningTitle}
            collapseContent={collapseContent}
          />
        )}
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
