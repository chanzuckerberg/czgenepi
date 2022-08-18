import { Tooltip } from "czifui";
import { MouseEventHandler } from "react";
import { TreeType, TreeTypes } from "src/common/constants/types";
import { StyledButton, StyledButtonWrapper } from "./style";

interface Props {
  hasSamples: boolean;
  hasValidName: boolean;
  isInEditMode: boolean;
  treeType: TreeType | undefined;
  onClick: MouseEventHandler;
}

const CreateTreeButton = ({
  hasSamples,
  hasValidName,
  isInEditMode,
  treeType,
  onClick,
}: Props): JSX.Element => {
  const NO_NAME_NO_SAMPLES =
    "Your tree requires a Tree Name & at least 1 Sample or Sample ID.";
  const NO_NAME = "Your tree requires a Tree Name.";
  const NO_SAMPLES = "Your tree requires at least 1 Sample or Sample ID.";
  const SAMPLES_ARE_IN_EDIT =
    "Finish adding Sample IDs before creating your tree.";
  const NO_TREE_TYPE_SELECTED = "Please select a Tree Type to proceed.";

  let tooltipTitle = "";
  const treeTypeNeedsSamples = treeType === TreeTypes.Targeted;
  const hasSamplesIfRequired =
    (treeTypeNeedsSamples && hasSamples) || !treeTypeNeedsSamples;

  if (!hasValidName && !hasSamplesIfRequired) tooltipTitle = NO_NAME_NO_SAMPLES;
  else if (!hasValidName) tooltipTitle = NO_NAME;
  else if (isInEditMode) tooltipTitle = SAMPLES_ARE_IN_EDIT;
  else if (!treeType) tooltipTitle = NO_TREE_TYPE_SELECTED;
  else if (!hasSamplesIfRequired) tooltipTitle = NO_SAMPLES;

  const isTreeBuildDisabled =
    !hasValidName || !hasSamplesIfRequired || isInEditMode || !treeType;

  return (
    <Tooltip
      arrow
      disableHoverListener={!isTreeBuildDisabled || !tooltipTitle}
      placement="top"
      title={tooltipTitle}
    >
      <StyledButtonWrapper>
        <StyledButton
          sdsType="primary"
          sdsStyle="rounded"
          disabled={isTreeBuildDisabled}
          type="submit"
          value="Submit"
          onClick={onClick}
        >
          Create Tree
        </StyledButton>
      </StyledButtonWrapper>
    </Tooltip>
  );
};

export { CreateTreeButton };
