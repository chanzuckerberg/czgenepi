import { Button } from "czifui";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { ROUTES } from "src/common/routes";
import Progress from "../common/Progress";
import { Content, Header, Title } from "../common/style";
import { Props } from "../common/types";
import Table from "./components/Table";

export default function Review({ samples, metadata }: Props): JSX.Element {
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
        <title>Aspen | Upload Review</title>
      </Head>
      <Header>
        <Title>Step 3</Title>
        <Progress step="3" />
      </Header>
      <Content>
        Content
        <Table metadata={metadata} />
        <div>
          <Button isRounded color="primary" variant="contained">
            Start Upload
          </Button>
          <Link href={ROUTES.UPLOAD_STEP2} passHref>
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
