import { Divider } from "@mui/material";
import { IconButton } from "./components/IconButton";
import { MoreActionsMenu } from "./components/MoreActionMenu";
import { TreeSelectionMenu } from "./components/TreeSelectionMenu";
import { StyledChip, StyledSelectedCount, StyledWrapper, TooltipDescriptionText, TooltipHeaderText } from "./style";

// TODO-TR (mlila): modify these props when removing from data_subview ...
// TODO-TR
interface Props {
  canEditSamples: boolean;
  checkedSampleIds: string[];
  openDownloadMenu(): void;
  openNSTreeModal(): void;
  openUsherModal(): void;
}

const SampleTableActions = ({
  canEditSamples,
  checkedSampleIds,
  openDownloadMenu,
  openNSTreeModal,
  openUsherModal,
}: Props): JSX.Element => {
  const DOWNLOAD_TOOLTIP_TEXT_DISABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
      <TooltipDescriptionText>Select at least 1 sample</TooltipDescriptionText>
    </div>
  );

  const DOWNLOAD_TOOLTIP_TEXT_ENABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
    </div>
  );

  const numCheckedSamples = checkedSampleIds?.length;
  const hasCheckedSamples = numCheckedSamples > 0;
  const hasTooManySamples = numCheckedSamples > 2000;

  return (
    <StyledWrapper>
      <StyledChip
        isRounded
        label={numCheckedSamples}
        status="info"
        data-test-id="selected-sample-count"
      />
      <StyledSelectedCount>Selected </StyledSelectedCount>
      <Divider />
      <TreeSelectionMenu
        handleCreateNSTreeOpen={openNSTreeModal}
        handleCreateUsherTreeOpen={openUsherModal}
        isMenuDisabled={hasTooManySamples}
        isUsherDisabled={!hasCheckedSamples}
      />
      <IconButton
        onClick={openDownloadMenu}
        disabled={!hasCheckedSamples}
        sdsIcon="download"
        tooltipTextDisabled={DOWNLOAD_TOOLTIP_TEXT_DISABLED}
        tooltipTextEnabled={DOWNLOAD_TOOLTIP_TEXT_ENABLED}
        size="large"
      />
      <MoreActionsMenu
        disabled={!hasCheckedSamples}
        isSampleEditDisabled={!canEditSamples}
        onDeleteSelected={() => setDeleteSampleConfirmationOpen(true)}
        onEditSelected={() => setEditSampleConfirmationOpen(true)}
        data-test-id="sample-page-more-action-btn"
      />
    </StyledWrapper>
  );
};

export { SampleTableActions };
