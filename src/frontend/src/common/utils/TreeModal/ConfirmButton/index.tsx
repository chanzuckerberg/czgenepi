import { Button, ButtonProps, Link } from "czifui";
import React, { FC, useEffect, useState } from "react";
import { DEFAULT_FETCH_OPTIONS } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { stripProtocol } from "../../urlUtils";

interface Props extends ButtonProps {
  treeId: number;
}

const ConfirmButton = (props: Props) => {
  const { treeId, ...rest } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [url, setUrl] = useState("");
  useEffect(() => {
    setIsLoading(true);
    getUrl();

    async function getUrl() {
      try {
        setUrl(await getTreeUrl(treeId));
        setIsLoading(false);
      } catch {
        setIsLoading(false);
        setHasError(true);
      }
    }
  }, [treeId]);

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
      disabled={isLoading || hasError || !url}
    >
      {getText({ hasError, isLoading })}
    </Button>
  );

  return url ? (
    <Link href={url} target="_blank" rel="noopener">
      {Content}
    </Link>
  ) : (
    Content
  );
};

export const createConfirmButton = (treeId: number): FC => {
  const TempConfirmButton = (props: ButtonProps) => (
    <ConfirmButton {...props} treeId={treeId} />
  );

  TempConfirmButton.displayName = "TempConfirmButton";

  return TempConfirmButton;
};

async function getTreeUrl(treeId: number) {
  const result = await fetch(
    `${ENV.API_URL}/api/auspice/view/${treeId}`,
    DEFAULT_FETCH_OPTIONS
  );

  const json = await result.json();

  const encodedJsonUrl = encodeURIComponent(stripProtocol(json.url));

  return "https://nextstrain.org/fetch/" + encodedJsonUrl;
}
