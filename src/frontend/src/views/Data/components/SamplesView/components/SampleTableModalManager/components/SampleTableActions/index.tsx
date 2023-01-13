import NextLink from "next/link";
import { ROUTES } from "src/common/routes";
import { IconButton } from "../IconButton";
import { MoreActionsMenu } from "./components/MoreActionMenu";
import { TreeSelectionMenu } from "./components/TreeSelectionMenu";
import {
  Divider,
  StyledChip,
  StyledSelectedCount,
  StyledUploadButton,
  StyledWrapper,
  TooltipDescriptionText,
  TooltipHeaderText,
} from "./style";

interface Props {
  canEditSamples: boolean;
  checkedSampleIds: string[];
  openDeleteSampleModal(): void;
  openEditSampleModal(): void;
  openDownloadMenu(): void;
  openNSTreeModal(): void;
  openUsherModal(): void;
}

const SampleTableActions = ({
  canEditSamples,
  checkedSampleIds,
  openDeleteSampleModal,
  openEditSampleModal,
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
        openNSTreeModal={openNSTreeModal}
        openUsherModal={openUsherModal}
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
        onDeleteSelected={openDeleteSampleModal}
        onEditSelected={openEditSampleModal}
        data-test-id="sample-page-more-action-btn"
      />
      <NextLink href={ROUTES.UPLOAD_STEP1} passHref>
        <StyledUploadButton
          component="a"
          href="passHref"
          sdsType="primary"
          sdsStyle="rounded"
          data-test-id="upload-btn"
        >
          Upload
        </StyledUploadButton>
      </NextLink>
    </StyledWrapper>
  );
};

export { SampleTableActions };
