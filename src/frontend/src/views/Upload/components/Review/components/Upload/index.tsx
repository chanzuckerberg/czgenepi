import { Dialog } from "@material-ui/core";
import { AlertTitle } from "@material-ui/lab";
import { Alert, Button } from "czifui";
import NextLink from "next/link";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { createSamples } from "src/common/queries/samples";
import { ROUTES } from "src/common/routes";
import { ContinueButton } from "../../../common/style";
import { SampleIdToMetadata, Samples } from "../../../common/types";
import {
  ImageWrapper,
  StyledDialogActions,
  StyledDialogContent,
  StyledUploadFailedImage,
  StyledUploadImage,
  Subtitle,
  Title,
} from "./style";

interface Props {
  isDisabled: boolean;
  samples: Samples | null;
  metadata: SampleIdToMetadata | null;
  cancelPrompt: () => void;
}

export default function Upload({
  isDisabled,
  samples,
  metadata,
  cancelPrompt,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isLoading, isSuccess, isError, error } = useMutation(
    createSamples,
    {
      onSuccess: () => {
        cancelPrompt();
      },
    }
  );

  return (
    <>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={isOpen}
        onClose={handleClose}
      >
        <StyledDialogContent>
          <ImageWrapper>{getImage()}</ImageWrapper>
          <Title>{getTitleText()}</Title>
          <Subtitle>{getSubtitleText()}</Subtitle>
        </StyledDialogContent>
        <StyledDialogActions>
          <PrimaryButtonWrapper>
            <Button
              disabled={isLoading}
              color="primary"
              variant="contained"
              isRounded
              onClick={handlePrimaryButtonClick}
            >
              {getPrimaryButtonText()}
            </Button>
          </PrimaryButtonWrapper>
          {!isSuccess && (
            <NextLink href={ROUTES.DATA_SAMPLES} passHref>
              <a href="passRef">
                <Button
                  color="primary"
                  variant="outlined"
                  isRounded
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </a>
            </NextLink>
          )}
        </StyledDialogActions>
      </Dialog>

      <ContinueButton
        disabled={isDisabled}
        isRounded
        color="primary"
        variant="contained"
        onClick={handleUploadClick}
      >
        Start Upload
      </ContinueButton>
    </>
  );

  function handleClose() {
    setIsOpen(false);
  }

  function handleUploadClick() {
    setIsOpen(true);
    uploadSamples();
  }

  function uploadSamples() {
    mutate({ metadata, samples });
  }

  function getTitleText() {
    if (isLoading) return "Uploading Your Samples…";
    if (isSuccess) return "Upload Complete!";
    if (isError) return "Upload Failed";
  }

  function getSubtitleText() {
    if (isLoading) return "Stay on this page until upload completes.";
    if (isSuccess) return "Your upload has been added to your Samples table.";
    if (isError) {
      const message = (error as Error)?.message;

      return (
        <Alert severity="error">
          <AlertTitle>
            Something went wrong, and we were unable to finish your upload.
          </AlertTitle>
          <div>
            You may retry or{" "}
            <NewTabLink href="mailto:helloaspen@chanzuckerberg.com">
              contact us
            </NewTabLink>{" "}
            for help.
          </div>
          {message && <div>System message: {message}</div>}
        </Alert>
      );
    }
  }

  function PrimaryButtonWrapper({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element {
    if (isSuccess) {
      return (
        <NextLink href={ROUTES.DATA_SAMPLES} passHref>
          <a href="passHref">{children}</a>
        </NextLink>
      );
    }

    return <>{children}</>;
  }

  function getPrimaryButtonText() {
    if (isLoading) return "Upload In-progress...";
    if (isSuccess) return "Go to Samples";
    if (isError) return "Retry Upload";
  }

  function handlePrimaryButtonClick() {
    if (isError) {
      return uploadSamples();
    }
  }

  function getImage(): JSX.Element {
    if (isError) {
      return <StyledUploadFailedImage height="96" width="148" />;
    }

    return <StyledUploadImage height="115" width="148" />;
  }
}
