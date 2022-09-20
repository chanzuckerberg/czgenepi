import { StyledNewTabLink } from "./style";

interface Props {
  usherLink: string;
}

export const UsherPlacementSuccessNotif = ({ usherLink }: Props): JSX.Element => (
  <div>
    Your samples were successfuly sent to UShER. It may take a few minutes for your placement to load.{" "}
    <StyledNewTabLink href={usherLink}>
      View your placement
    </StyledNewTabLink>
    .
  </div>
);
