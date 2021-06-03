import { Button } from "czifui";
import React, { useState } from "react";
import FilePicker from "src/components/FilePicker";
import { SampleIdToMetadata } from "../../../common/types";
import Instructions from "./components/Instructions";
import { IntroWrapper, Title, TitleWrapper, Wrapper } from "./style";

interface Props {
  handleMetadata: (metadata: SampleIdToMetadata) => void;
}

export default function ImportFile({ handleMetadata }: Props): JSX.Element {
  const [isInstructionsShown, setIsInstructionsShown] = useState(false);

  const handleInstructionsClick = () => {
    setIsInstructionsShown(!isInstructionsShown);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    // TODO(thuang): process file to metadata
    const metadata: SampleIdToMetadata = {};
    handleMetadata(metadata);
  };

  return (
    <Wrapper>
      <IntroWrapper>
        <TitleWrapper>
          <Title>Import Data from a TSV file</Title>
          <Button color="primary" onClick={handleInstructionsClick}>
            {isInstructionsShown ? "HIDE" : "SHOW"} INSTRUCTIONS
          </Button>
          <Button color="primary">Download Metadata Template (TSV)</Button>
        </TitleWrapper>

        {isInstructionsShown && <Instructions />}
      </IntroWrapper>

      <div>
        <FilePicker
          handleFiles={handleFiles}
          text="Select Metadata File"
          accept=".tsv"
        />
      </div>
    </Wrapper>
  );
}
