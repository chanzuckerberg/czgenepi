import { Checkbox } from "czifui";
import { map, pickBy } from "lodash";
import React, { useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { useEditSamples } from "src/common/queries/samples";
import { ROUTES } from "src/common/routes";
import { B } from "src/common/styles/basicStyle";
import { getIdFromCollectionLocation } from "src/common/utils/locationUtils";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import { SampleEditMetadataWebform } from "src/components/WebformTable/common/types";
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

export type MetadataWithIdType = Record<
  string,
  SampleEditMetadataWebform & { id: number }
> | null;

interface Props {
  changedMetadata: MetadataType;
  metadataWithId: MetadataWithIdType;
  onClickBack(): void;
  onSave(): void;
  onSaveFailure(): void;
  onSaveSuccess(): void;
}

const EditSamplesReviewDialog = ({
  changedMetadata,
  metadataWithId,
  onClickBack,
  onSave,
  onSaveFailure,
  onSaveSuccess,
}: Props): JSX.Element => {
  const [isChecked, setChecked] = useState<boolean>(false);

  const editSampleMutation = useEditSamples({
    componentOnSuccess: () => {
      onSaveSuccess();
    },
    componentOnError: () => {
      onSaveFailure();
    },
  });

  const handleSave = () => {
    if (metadataWithId) {
      const samples = map(metadataWithId, (m) => ({
        collection_date: m.collectionDate,
        collection_location: getIdFromCollectionLocation(m.collectionLocation),
        id: m.id,
        private: m.keepPrivate,
        private_identifier: m.privateId,
        public_identifier: m.publicId,
        sequencing_date: m.sequencingDate,
      }));
      editSampleMutation.mutate({
        samples,
      });
    }

    onSave();
    setChecked(false);
  };

  // determine whether any samples have changed privacy settings so
  // we know to show the warning
  if (!changedMetadata) changedMetadata = {};
  const privacyChangedSamples = Object.keys(
    pickBy(changedMetadata, (data) => {
      return Object.prototype.hasOwnProperty.call(data, "keepPrivate");
    })
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
      <Table metadata={metadataWithId} />
      <CheckboxWrapper onClick={() => setChecked(!isChecked)}>
        <Checkbox stage={isChecked ? "checked" : "unchecked"} />
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
        <StyledButton
          sdsType="primary"
          sdsStyle="rounded"
          disabled={!isChecked}
          onClick={handleSave}
        >
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
