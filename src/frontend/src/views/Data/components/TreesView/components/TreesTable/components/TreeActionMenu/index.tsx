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
      <OpenInNextstrainButton phyloRun={phyloRun} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <OpenInGalagoButton phyloRun={phyloRun} />
    </StyledActionWrapper>

    <StyledActionWrapper>
      <TreeTableDownloadMenu phyloRun={phyloRun} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <MoreActionsMenu phyloRun={phyloRun} />
    </StyledActionWrapper>
  </StyledTreeActionMenu>
);

export { TreeActionMenu };
