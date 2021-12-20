import React from "react";
import { UserResponse } from "src/common/queries/auth";
import { MoreActionsMenu } from "./components/MoreActionsMenu";
import { OpenInNextstrainButton } from "./components/OpenInNextstrainButton";
import TreeTableDownloadMenu from "./components/TreeTableDownloadMenu";
import { StyledActionWrapper, StyledTreeActionMenu } from "./style";

interface Props {
  value: string;
  item: Tree;
  userInfo: UserResponse;
  onDeleteTreeModalOpen(t: Tree): void;
}

const TreeActionMenu = ({
  item,
  onDeleteTreeModalOpen,
  userInfo,
  value,
}: Props): JSX.Element => (
  <StyledTreeActionMenu>
    <StyledActionWrapper>
      <OpenInNextstrainButton item={item} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <TreeTableDownloadMenu item={item} value={value} />
    </StyledActionWrapper>
    <StyledActionWrapper>
      <MoreActionsMenu
        item={item}
        onDeleteTreeModalOpen={onDeleteTreeModalOpen}
        userInfo={userInfo}
      />
    </StyledActionWrapper>
  </StyledTreeActionMenu>
);

export { TreeActionMenu };
