import { MoreActionsMenu } from "./components/MoreActionsMenu";
import { OpenInGalagoButton } from "./components/OpenInGalagoButton";
import { OpenInNextstrainButton } from "./components/OpenInNextstrainButton";
import TreeTableDownloadMenu from "./components/TreeTableDownloadMenu";
import { StyledActionWrapper, StyledTreeActionMenu } from "./style";

interface Props {
  phyloRun: PhyloRun;
}

const TreeActionMenu = ({ phyloRun }: Props): JSX.Element => (
  <StyledTreeActionMenu
    role="group"
    aria-label={`${phyloRun?.name} tree actions`}
  >
    <StyledActionWrapper>
      <OpenInNextstrainButton tree={phyloRun} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <OpenInGalagoButton tree={phyloRun} />
    </StyledActionWrapper>

    <StyledActionWrapper>
      // TODO-TR: tree= ... update prop name
      <TreeTableDownloadMenu tree={phyloRun} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <MoreActionsMenu phyloRun={phyloRun} />
    </StyledActionWrapper>
  </StyledTreeActionMenu>
);

export { TreeActionMenu };
