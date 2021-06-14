import { Button } from "czifui";
import React, { useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import FilePicker from "src/components/FilePicker";
import {
  ERROR_CODE,
  Props as CommonProps,
  WARNING_CODE,
} from "src/views/Upload/components/common/types";
import { METADATA_KEYS_TO_HEADERS } from "../../../common/constants";
import Error from "./components/Alerts/Error";
import Success from "./components/Alerts/Success";
import Warning from "./components/Alerts/Warning";
import DownloadTemplate from "./components/DownloadTemplate";
import Instructions from "./components/Instructions";
import { EXAMPLES } from "./constants";
import { parseFile, ParseResult } from "./parseFile";
import { IntroWrapper, Title, TitleWrapper, Wrapper } from "./style";

interface Props {
  handleMetadata: (result: ParseResult) => void;
  samples: CommonProps["samples"];
}

export type Warnings = ParseResult["warningMessages"];

export default function ImportFile({
  handleMetadata,
  samples,
}: Props): JSX.Element {
  const [isInstructionsShown, setIsInstructionsShown] = useState(false);
  const [hasImportedFile, setHasImportedFile] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [autocorrectCount, setAutocorrectCount] = useState<number>(0);
  const [filename, setFilename] = useState("");

  const handleInstructionsClick = () => {
    setIsInstructionsShown(!isInstructionsShown);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const result = await parseFile(files[0]);

    const { errorMessages, warningMessages, filename } = result;

    const missingFields = Array.from(
      errorMessages.get(ERROR_CODE.MISSING_FIELD) || []
    );

    const autocorrectCount =
      warningMessages.get(WARNING_CODE.AUTO_CORRECT)?.size || 0;

    setHasImportedFile(true);
    setMissingFields(missingFields);
    setAutocorrectCount(autocorrectCount);
    setFilename(filename);

    handleMetadata(result);
  };

  const { headers, rows } = createTsv(samples);

  return (
    <Wrapper>
      <IntroWrapper>
        <TitleWrapper>
          <Title>Import Data from a TSV file</Title>
          <Button color="primary" onClick={handleInstructionsClick}>
            {isInstructionsShown ? "HIDE" : "SHOW"} INSTRUCTIONS
          </Button>
          <DownloadTemplate headers={headers} rows={rows}>
            <Button color="primary">Download Metadata Template (TSV)</Button>
          </DownloadTemplate>
        </TitleWrapper>

        {isInstructionsShown && <Instructions headers={headers} rows={rows} />}
      </IntroWrapper>

      <div>
        <FilePicker
          handleFiles={handleFiles}
          text="Select Metadata File"
          accept=".tsv"
          shouldConfirm={hasImportedFile}
          confirmTitle="Are you sure you want to import new data?"
          confirmContent={
            "Your existing metadata will be replaced with the " +
            "information found in the new import file."
          }
        />
      </div>

      <RenderOrNull condition={hasImportedFile}>
        <Success filename={filename} />
      </RenderOrNull>

      <RenderOrNull condition={missingFields.length}>
        <Error errorCode={ERROR_CODE.MISSING_FIELD} names={missingFields} />
      </RenderOrNull>

      <RenderOrNull condition={autocorrectCount}>
        <Warning sampleCount={autocorrectCount} />
      </RenderOrNull>
    </Wrapper>
  );
}

function createTsv(samples: CommonProps["samples"]): {
  headers: string[];
  rows: string[][];
} {
  const {
    sampleId,
    collectionDate,
    collectionLocation,
    sequencingDate,
    keepPrivate,
    submittedToGisaid,
    publicId,
    islAccessionNumber,
  } = METADATA_KEYS_TO_HEADERS;

  const rows = Object.keys(samples || EMPTY_OBJECT).map((sampleId, index) => [
    String(index + 1),
    sampleId,
  ]);

  return {
    headers: [
      "",
      sampleId,
      collectionDate,
      collectionLocation,
      sequencingDate,
      keepPrivate,
      submittedToGisaid,
      publicId,
      islAccessionNumber,
    ],
    rows: [...EXAMPLES, ...rows],
  };
}

function RenderOrNull({
  condition,
  children,
}: {
  condition: unknown;
  children: React.ReactNode;
}): JSX.Element | null {
  if (!condition) return null;

  return <>{children}</>;
}
