import { useTreatments } from "@splitsoftware/splitio-react";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { MoreActionsMenu } from "./components/MoreActionsMenu";
import { OpenInGalagoButton } from "./components/OpenInGalagoButton";
import { OpenInNextstrainButton } from "./components/OpenInNextstrainButton";
import TreeTableDownloadMenu from "./components/TreeTableDownloadMenu";
import { StyledActionWrapper, StyledTreeActionMenu } from "./style";

interface Props {
  // FIXME kinda sorta, but really more of a REFACTOR ME (Vince)
  // The `value` is necessary to keep TypeScript happy b/c of how the table
  // renderers assume structure: they assume there's a single cell
  // "attached" to a key name, and that key name in the overarching row object
  // (`item`) should be presented to the cell renderer as a `value` to render.
  // It also presents the entire `item` as a fallback. However, because
  // TreeActionMenu sort of represents multiple cells at once, it's not
  // reasonable to pass a single cell `value`, and it really only cares about
  // the whole `item`, which then has its various constituent parts pulled out
  // by the sub-components.
  // HOWEVER, because of the fact that the renderer attempts to pass `value`
  // no matter what, TypeScript gets angry if we just remove it from Props
  // interface. Instead, we just don't pull the `value` from the passed props
  // because it's not actually useful to us for this component.
  // TODO-TR (mlila): value can be removed after table refactor
  value: string;
  item: PhyloRun;
  userInfo: User;
  onDeleteTreeModalOpen?(t: PhyloRun): void;
  onEditTreeModalOpen?(t: PhyloRun): void;
}

const TreeActionMenu = ({
  // `value` unused, see wall of text above. TL;DR in Props to keep TS happy
  // value,
  item,
  onDeleteTreeModalOpen,
  onEditTreeModalOpen,
  userInfo,
}: Props): JSX.Element => {
  const flag = useTreatments([USER_FEATURE_FLAGS.galago_integration]);
  const isGalagoIntegrationFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.galago_integration
  );

  return (
    <StyledTreeActionMenu
      role="group"
      aria-label={`${item?.name} tree actions`}
    >
      <StyledActionWrapper>
        <OpenInNextstrainButton item={item} />
      </StyledActionWrapper>
      {isGalagoIntegrationFlagOn && (
        <StyledActionWrapper>
          <OpenInGalagoButton item={item} />
        </StyledActionWrapper>
      )}
      <StyledActionWrapper>
        <TreeTableDownloadMenu item={item} />
      </StyledActionWrapper>
      <StyledActionWrapper>
        <MoreActionsMenu
          item={item}
          onDeleteTreeModalOpen={onDeleteTreeModalOpen}
          onEditTreeModalOpen={onEditTreeModalOpen}
          userInfo={userInfo}
        />
      </StyledActionWrapper>
    </StyledTreeActionMenu>
  );
};

export { TreeActionMenu };
