import { Close } from "@material-ui/icons";
import { Button } from "czifui";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { ROUTES } from "src/common/routes";
import AlertAccordion from "src/components/AlertAccordion";
import FilePicker from "src/components/FilePicker";
import Instructions from "src/components/Instructions";
import Progress from "../common/Progress";
import { Content, Header, Title } from "../common/style";
import { ParseErrors, Props, Samples as ISamples } from "../common/types";
import { handleFiles } from "./utils";

export default function Samples({ samples, setSamples }: Props): JSX.Element {
  const [parseErrors, setParseErrors] = useState<ParseErrors | null>(null);

  // DEBUG
  // DEBUG
  // DEBUG
  // eslint-disable-next-line no-console
  console.log(
    "--------->current samples in React state",
    JSON.stringify(samples)
  );

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;

    const { result, errors } = await handleFiles(files);

    // DEBUG
    // DEBUG
    // DEBUG
    // (thuang): This is for you to see the parsed JS object in the console!
    // eslint-disable-next-line no-console
    console.log("@@@@@@@@@@@@ parsed result", result);
    // eslint-disable-next-line no-console
    console.log("@@@@@@@@@@@@ parsed errors", errors);
    // eslint-disable-next-line no-console
    console.log("-----Object.keys(result)", Object.keys(result));
    // eslint-disable-next-line no-console
    console.log("-----Object.keys(result).length", Object.keys(result).length);

    setSamples({
      ...removeSamplesFromTheSameFiles(samples, result),
      ...result,
    });

    setParseErrors(errors);
  };

  const handleRemoveAllClick = () => {
    setSamples(null);
    setParseErrors(null);
  };

  return (
    <>
      <Head>
        <title>Aspen | Upload Sample</title>
      </Head>
      <Header>
        <Title>Step 1</Title>
        <Progress step="1" />
      </Header>
      <Content>
        <Instructions title="File instructions" items={["a", "b", "c"]} />
        <FilePicker
          text="Select Fasta Files"
          multiple
          handleFiles={handleFileChange}
          accept=".fasta,.fa,.gz,.zip"
        />
        <Button
          color="primary"
          variant="text"
          onClick={handleRemoveAllClick}
          startIcon={<Close />}
        >
          REMOVE ALL
        </Button>
        <AlertAccordion
          variant="error"
          title="Some of your files could not be uploaded."
          message={"Error table component here: " + JSON.stringify(parseErrors)}
        />

        <div>
          <Link href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="contained">
                Continue
              </Button>
            </a>
          </Link>
          <Link href={ROUTES.DATA_SAMPLES} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="outlined">
                Cancel
              </Button>
            </a>
          </Link>
        </div>
      </Content>
    </>
  );
}

function removeSamplesFromTheSameFiles(
  samples: ISamples | null,
  newSamples: ISamples
) {
  if (!samples) return samples;

  const newFiles = new Set(
    Object.values(newSamples).map((sample) => sample.filename)
  );

  const result: ISamples = {};

  for (const [id, sample] of Object.entries(samples)) {
    if (newFiles.has(sample.filename)) continue;
    result[id] = sample;
  }

  return result;
}
