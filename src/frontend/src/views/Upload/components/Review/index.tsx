import { Button, Checkbox } from "czifui";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import Progress from "../common/Progress";
import {
  ButtonWrapper,
  Content,
  Header,
  Subtitle,
  Title,
} from "../common/style";
import { Props } from "../common/types";
import { maybePluralize } from "../Metadata/components/ImportFile/components/Alerts/common/pluralize";
import Table from "./components/Table";
import Upload from "./components/Upload";
import {
  CheckboxText,
  CheckboxWrapper,
  ContentTitle,
  ContentTitleWrapper,
} from "./style";

export default function Review({ samples, metadata }: Props): JSX.Element {
  const { data } = useUserInfo();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isPublicChecked, setIsPublicChecked] = useState(false);

  const group = data?.group;

  const numOfSamples = Object.keys(samples || EMPTY_OBJECT).length;

  function handleConsentCheck() {
    setIsConsentChecked((prevState: boolean) => !prevState);
  }

  function handlePublicCheck() {
    setIsPublicChecked((prevState: boolean) => !prevState);
  }

  return (
    <>
      <Head>
        <title>Aspen | Upload Review</title>
      </Head>
      <Header>
        <div>
          <Title>Review</Title>
          <Subtitle>
            Uploading {numOfSamples} {maybePluralize("Sample", numOfSamples)} to{" "}
            {group?.name}
          </Subtitle>
        </div>
        <Progress step="3" />
      </Header>
      <Content>
        <ContentTitleWrapper>
          <ContentTitle>Sample Info</ContentTitle>
          <Link href={ROUTES.UPLOAD_STEP1} passHref>
            <a href="passHref">
              <Button color="primary" variant="text">
                Edit Samples
              </Button>
            </a>
          </Link>
          <Link href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <Button color="primary" variant="text">
                Edit Metadata
              </Button>
            </a>
          </Link>
        </ContentTitleWrapper>

        <Table metadata={metadata} />

        <CheckboxWrapper>
          <CheckboxText onClick={handleConsentCheck}>
            <Checkbox checked={isConsentChecked} color="primary" />I agree that
            the data I am uploading to Aspen has been lawfully collected and
            that I have all the necessary consents, permissions, and
            authorizations needed to collect, share and export data as outlined
            in the Terms and Data Privacy Notice. I have reviewed the data that
            I am uploading and can confirm that I am not uploading any
            personally identifiable information.
          </CheckboxText>

          <CheckboxText onClick={handlePublicCheck}>
            <Checkbox checked={isPublicChecked} color="primary" />I understand
            that samples marked Public will be shared with California Department
            of Health on Aspen and that sharing samples on Aspen does not
            satisfy CDPH reporting requirements.
          </CheckboxText>
        </CheckboxWrapper>

        <ButtonWrapper>
          <Upload
            samples={samples}
            metadata={metadata}
            isDisabled={!isConsentChecked || !isPublicChecked}
          />
          <Link href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="outlined">
                Back
              </Button>
            </a>
          </Link>
        </ButtonWrapper>
      </Content>
    </>
  );
}
