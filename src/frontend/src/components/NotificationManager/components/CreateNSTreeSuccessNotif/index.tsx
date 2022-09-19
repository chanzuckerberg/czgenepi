import NextLink from "next/link";
import { ROUTES } from "src/common/routes";
import { StyledButton } from "./style";

interface Props {
  onDismiss(): void;
}

export const CreateNSTreeSuccessNotif = ({ onDismiss }: Props): JSX.Element => (
  <>
    <span>
      Your tree is being created. It may take up to 12 hours to process. To
      check your tree’s status, visit the Phylogenetic Tree tab.
    </span>
    <NextLink href={ROUTES.PHYLO_TREES} passHref>
      <a href="passRef">
        <StyledButton
          sdsType="primary"
          sdsStyle="minimal"
          onClick={onDismiss}
        >
          VIEW MY TREES
        </StyledButton>
      </a>
    </NextLink>
  </>
);
