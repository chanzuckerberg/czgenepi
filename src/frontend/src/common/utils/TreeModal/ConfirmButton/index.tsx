import { Button, ButtonProps } from "czifui";
import { useEffect, useState } from "react";
import {
  DEFAULT_POST_OPTIONS,
  generateOrgSpecificUrl,
  ORG_API,
} from "src/common/api";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import ENV from "src/common/constants/ENV";
import { ROUTES } from "src/common/routes";

type OutgoingDestination = "galago" | "nextstrain";

interface Props extends ButtonProps {
  treeId: number;
  outgoingDestination: OutgoingDestination;
}

// How our various destinations construct their fetch routes
const ROUTE_LOOKUP: Record<OutgoingDestination, string> = {
  galago: ROUTES.GALAGO + "#/fetch/",
  nextstrain: ROUTES.NEXTSTRAIN + "fetch/"
};

// Get URL for where we should send user based on tree + destination.
const getOutgoingUrl = async (treeId: number, outgoingDestination: OutgoingDestination) => {
  // Start by having BE make a URL we can get the tree's JSON from publicly.
  const requestData = { tree_id: treeId };
  const result = await fetch(
    `${ENV.API_URL}${generateOrgSpecificUrl(ORG_API.AUSPICE)}`,
    {
      body: JSON.stringify(requestData),
      ...DEFAULT_POST_OPTIONS,
    }
  );
  const json = await result.json();

  const destinationFetchRoute = ROUTE_LOOKUP[outgoingDestination];
  return destinationFetchRoute + json.url;
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

/**
 * Button to send user to a different site to do analysis on a tree they made.
 *
 * We send the user to various other apps so they can do analysis on a tree
 * they produced in our app. This component has the logic to pull a public
 * URL for specified tree from BE, then send the user to the specified
 * destination with that tree embedded in the link out when clicked.
 */
export const ConfirmButton = (props: Props): JSX.Element => {
  const { treeId, outgoingDestination, ...rest } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const getUrl = async () => {
      try {
        setUrl(await getOutgoingUrl(treeId, outgoingDestination));
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
