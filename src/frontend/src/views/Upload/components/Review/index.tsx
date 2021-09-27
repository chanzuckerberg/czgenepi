import { Button, Checkbox, Link } from "czifui";
import Head from "next/head";
import NextLink from "next/link";
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

export default function Review({
  samples,
  metadata,
  cancelPrompt,
}: Props): JSX.Element {
  const { data } = useUserInfo();
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  const group = data?.group;

  const numOfSamples = Object.keys(samples || EMPTY_OBJECT).length;

  function handleConsentCheck() {
    setIsConsentChecked((prevState: boolean) => !prevState);
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
          <NextLink href={ROUTES.UPLOAD_STEP1} passHref>
            <a href="passHref">
              <Button color="primary" variant="text">
                Edit Samples
              </Button>
            </a>
          </NextLink>
          <NextLink href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <Button color="primary" variant="text">
                Edit Metadata
              </Button>
            </a>
          </NextLink>
        </ContentTitleWrapper>

        <Table metadata={metadata} />

        <CheckboxWrapper>
          <CheckboxText onClick={handleConsentCheck}>
            <Checkbox checked={isConsentChecked} color="primary" />
            <span>
              I agree that the data I am uploading to Aspen has been lawfully
              collected and that I have all the necessary consents, permissions,
              and authorizations needed to collect, share and export data as
              outlined in the{" "}
              <Link href={ROUTES.TERMS} target="_blank" rel="noopener">
                Terms
              </Link>{" "}
              and{" "}
              <Link href={ROUTES.PRIVACY} target="_blank" rel="noopener">
                Privacy Policy
              </Link>
              . I have reviewed the data that I am uploading and can confirm
              that I am not uploading any personally identifiable information.
            </span>
          </CheckboxText>
        </CheckboxWrapper>

        <ButtonWrapper>
          <Upload
            samples={samples}
            metadata={metadata}
            isDisabled={!isConsentChecked}
            cancelPrompt={cancelPrompt}
          />
          <NextLink href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="outlined">
                Back
              </Button>
            </a>
          </NextLink>
        </ButtonWrapper>
      </Content>
    </>
  );
}
