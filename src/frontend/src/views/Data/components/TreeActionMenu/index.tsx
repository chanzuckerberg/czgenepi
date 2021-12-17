import React from "react";
import { MoreActionsMenu } from "./components/MoreActionsMenu";
import { OpenInNextstrainButton } from "./components/OpenInNextstrainButton";
import TreeTableDownloadMenu from "./components/TreeTableDownloadMenu";
import { StyledActionWrapper, StyledTreeActionMenu } from "./style";

interface Props {
  value: string;
  item: TableItem;
}

const TreeActionMenu = ({ item, value }: Props): JSX.Element => (
  <StyledTreeActionMenu>
    <StyledActionWrapper>
      <OpenInNextstrainButton item={item} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <TreeTableDownloadMenu item={item} value={value} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <MoreActionsMenu item={item} />
    </StyledActionWrapper>
  </StyledTreeActionMenu>
);

export { TreeActionMenu };
