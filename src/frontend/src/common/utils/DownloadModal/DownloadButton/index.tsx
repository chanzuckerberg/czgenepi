import { Button, ButtonProps, Link } from "czifui";
import React, { FC, useEffect, useState } from "react";
import { downloadSamplesFasta } from "src/common/queries/samples"

interface Props extends ButtonProps {
  privateIds: Array[string];
}

const ConfirmButton = (props: Props) => {
  const { privateIds, ...rest } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [data, setData] = useState([]);

  const d = getDownloadData(privateIds);

//   useEffect(() => {
//     setIsLoading(true);
//     getUrl();

//     async function getData() {
//       try {
//         setData(getDownloadData(privateIds));
//         setIsLoading(false);
//       } catch {
//         setIsLoading(false);
//         setHasError(true);
//       }
//     }
//   }, [privateIds]);

  function getText({
    isLoading,
    hasError,
  }: {
    isLoading: boolean;
    hasError: boolean;
  }) {
    if (isLoading) return "Loading...";
    if (hasError) return "Not available";
    return "Confirm";
  }

  const Content = (
    <Button
      {...rest}
      color="primary"
      variant="contained"
      isRounded
      disabled={isLoading || hasError || !data}
      data-test-id="download-link-button"
    >
      {getText({ hasError, isLoading })}
    </Button>
  );

  return Content;
};

export const createConfirmButton = (samples: string[]): FC => {
  const TempConfirmButton = (props: ButtonProps) => (
    <ConfirmButton {...props} samples={samples} />
  );

  TempConfirmButton.displayName = "TempConfirmButton";

  return TempConfirmButton;
};

async function getDownloadData(samples: string[]) {
  const result = await downloadSamplesFasta(samples);

  const json = await result.json();
  console.log("RETURN JSON: ", json);
}