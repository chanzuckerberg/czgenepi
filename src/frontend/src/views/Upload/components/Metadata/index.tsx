import { Button } from "czifui";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { noop } from "src/common/constants/empty";
import { ROUTES } from "src/common/routes";
import Progress from "../common/Progress";
import { Content, Header, Subtitle, Title } from "../common/style";
import { Props } from "../common/types";
import ImportFile from "./components/ImportFile";
import Table from "./components/Table";
import { StyledInstructions } from "./style";

export default function Metadata({
  samples,
  metadata,
  setMetadata,
}: Props): JSX.Element {
  // DEBUG
  // DEBUG
  // DEBUG
  // eslint-disable-next-line no-console
  console.log("---samples", samples);
  // eslint-disable-next-line no-console
  console.log("---metadata", metadata);

  return (
    <>
      <Head>
        <title>Aspen | Upload Metadata</title>
      </Head>
      <Header>
        <div>
          <Title>Upload Metadata</Title>
          <Subtitle>
            Add metadata to your samples by importing or updating the table
            below.
          </Subtitle>
        </div>
        <Progress step="2" />
      </Header>
      <Content>
        <StyledInstructions
          title="Sample Privacy & Sharing"
          items={[
            "By default, all samples are shared with the California Department of Health.",
            "Samples shared with CDPH on Aspen do not fulfill any reporting requirements.",
            `If a sample should remain private to your County, please update the "Keep Private" setting to "Yes". Private samples will not be shared with CDPH.`,
          ]}
        />

        <ImportFile handleMetadata={noop} />

        <Table metadata={metadata} setMetadata={setMetadata} />

        <div>
          <Link href={ROUTES.UPLOAD_STEP3} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="contained">
                Continue
              </Button>
            </a>
          </Link>
          <Link href={ROUTES.UPLOAD_STEP1} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="outlined">
                Back
              </Button>
            </a>
          </Link>
        </div>
      </Content>
    </>
  );
}
