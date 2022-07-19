import { Button, ButtonProps } from "czifui";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DEFAULT_POST_OPTIONS,
  generateGroupSpecificUrl,
  ORG_API,
} from "src/common/api";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import ENV from "src/common/constants/ENV";
import { selectCurrentGroup } from "src/common/redux/selectors";

interface Props extends ButtonProps {
  treeId: number;
}

const getTreeUrl = async (treeId: number, groupId: number) => {
  const requestData = { tree_id: treeId };
  const result = await fetch(
    `${ENV.API_URL}${generateGroupSpecificUrl(ORG_API.AUSPICE, groupId)}`,
    {
      body: JSON.stringify(requestData),
      ...DEFAULT_POST_OPTIONS,
    }
  );

  const json = await result.json();

  return "https://nextstrain.org/fetch/" + json.url;
};

const getButtonText = ({
  isLoading,
  hasError,
}: {
  isLoading: boolean;
  hasError: boolean;
}) => {
  if (isLoading) return "Loading...";
  if (hasError) return "Not available";
  return "Confirm";
};

export const ConfirmButton = (props: Props): JSX.Element => {
  const { treeId, ...rest } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [url, setUrl] = useState("");
  const groupId = useSelector(selectCurrentGroup);

  useEffect(() => {
    const getUrl = async () => {
      try {
        setUrl(await getTreeUrl(treeId, groupId));
        setIsLoading(false);
      } catch {
        setIsLoading(false);
        setHasError(true);
      }
    };

    setIsLoading(true);
    getUrl();
  }, [treeId]);

  const ButtonContent = (
    <Button
      {...rest}
      sdsType="primary"
      sdsStyle="rounded"
      disabled={isLoading || hasError || !url}
      data-test-id="tree-link-button"
    >
      {getButtonText({ hasError, isLoading })}
    </Button>
  );

  return url ? (
    <NewTabLink data-test-id="tree-link" href={url}>
      {ButtonContent}
    </NewTabLink>
  ) : (
    ButtonContent
  );
};
