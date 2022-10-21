import { NewTabLink } from "src/common/components/library/NewTabLink";

interface Props {
  usherLink: string;
}

export const UsherPlacementSuccessNotif = ({
  usherLink,
}: Props): JSX.Element => (
  <span>
    Your samples were successfuly sent to UShER. It may take a few minutes for
    your placement to load.{" "}
    <NewTabLink href={usherLink} sdsStyle="dashed">
      View your placement
    </NewTabLink>
    .
  </span>
);
