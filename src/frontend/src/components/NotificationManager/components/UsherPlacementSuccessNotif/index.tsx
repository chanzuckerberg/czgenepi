import { StyledNewTabLink } from "./style";

export const UsherPlacementSuccessNotif = (): JSX.Element => (
  <div>
    Your samples were successfuly sent to UShER. It may take a few minutes for your placement to load.{" "}
    <StyledNewTabLink href={usherLink}>
      View your placement
    </StyledNewTabLink>
    .
  </div>
);
