import { ButtonIcon, Icon, Menu, MenuItem, Tooltip } from "czifui";
import { MouseEventHandler, ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import {
  AnalyticsTreeDownloadSelectedSamplesTemplate,
  AnalyticsTreeDownloadTreeFile,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { TREE_STATUS } from "src/common/constants/types";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { stringGuard } from "src/common/utils";

interface Props {
  phyloRun: PhyloRun;
}

const TreeTableDownloadMenu = ({ phyloRun }: Props): JSX.Element => {
  const {
    accessionsLink,
    downloadLinkIdStylePrivateIdentifiers,
    downloadLinkIdStylePublicIdentifiers,
    status,
  } = phyloRun;

  const pathogen = useSelector(selectCurrentPathogen);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick: MouseEventHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close download menu. Making any download choice should close menu.
  const baseHandleClose = () => {
    setAnchorEl(null);
  };

  // Tree download: close menu and fire analytics event.
  // Note that you need to pass an arg of the tree's ID type.
  const handleCloseWithTreeAnalytics = (
    sampleIdType: AnalyticsTreeDownloadTreeFile["sample_id_type"]
  ) => {
    const { treeId, phyloRunWorkflowId } = analyticsGetData(phyloRun);
    analyticsTrackEvent<AnalyticsTreeDownloadTreeFile>(
      EVENT_TYPES.TREE_DOWNLOAD_TREE_FILE,
      {
        tree_id: treeId || null,
        phylo_run_workflow_id: phyloRunWorkflowId || null,
        sample_id_type: sampleIdType,
        pathogen: pathogen,
      }
    );
    baseHandleClose();
  };

  // TSV template download: close menu and fire analytics event.
  const handleCloseWithTsvAnalytics = () => {
    const { treeId, phyloRunWorkflowId } = analyticsGetData(phyloRun);
    analyticsTrackEvent<AnalyticsTreeDownloadSelectedSamplesTemplate>(
      EVENT_TYPES.TREE_DOWNLOAD_SELECTED_SAMPLES_TEMPLATE,
      {
        tree_id: treeId || null,
        phylo_run_workflow_id: phyloRunWorkflowId || null,
        pathogen: pathogen,
      }
    );
    baseHandleClose();
  };

  const jsonLinkIdStylePrivateIdentifiers = stringGuard(
    downloadLinkIdStylePrivateIdentifiers
  );
  const jsonLinkIdStylePublicIdentifiers = stringGuard(
    downloadLinkIdStylePublicIdentifiers
  );
  const tsvDownloadLink = stringGuard(accessionsLink);
  const disabled = status !== TREE_STATUS.Completed;
  // TODO (mlila): This is necessary due to an sds bug -- MUI tooltips should not display
  // TODO          without content, but that functionality was accidentally removed here.
  // TODO          https://app.shortcut.com/sci-design-system/story/176947
  const MenuItemTooltip = ({
    children,
  }: {
    children: ReactNode;
  }): JSX.Element =>
    disabled ? (
      <Tooltip
        arrow
        title="This download is only available for completed trees."
        placement="top"
      >
        <div>{children}</div>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip arrow sdsStyle="dark" title="Download" placement="top">
        <ButtonIcon
          aria-label="download tree"
          onClick={handleClick}
          sdsSize="small"
          sdsType="primary"
          size="large"
        >
          <Icon sdsIcon="download" sdsSize="s" sdsType="iconButton" />
        </ButtonIcon>
      </Tooltip>
      {open && (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          open={open}
          onClose={baseHandleClose}
        >
          <NewTabLink href={jsonLinkIdStylePrivateIdentifiers}>
            <MenuItemTooltip>
              <MenuItem
                disabled={disabled}
                onClick={() => handleCloseWithTreeAnalytics("PRIVATE")}
              >
                {"Tree file with Private IDs (.json)"}
              </MenuItem>
            </MenuItemTooltip>
          </NewTabLink>
          <NewTabLink href={jsonLinkIdStylePublicIdentifiers}>
            <MenuItemTooltip>
              <MenuItem
                disabled={disabled}
                onClick={() => handleCloseWithTreeAnalytics("PUBLIC")}
              >
                {"Tree file with Public IDs (.json)"}
              </MenuItem>
            </MenuItemTooltip>
          </NewTabLink>
          <NewTabLink href={tsvDownloadLink}>
            <MenuItem onClick={handleCloseWithTsvAnalytics}>
              {"Private IDs (.tsv)"}
            </MenuItem>
          </NewTabLink>
        </Menu>
      )}
    </>
  );
};

/**
 * Pulls data necessary to send analytics event regarding tree/TSV download.
 *
 * For the most part, both values will exist when downloading. However, either
 * below could be `undefined`. The `treeId` could be undefined if tree is still
 * processing or failed. I think `phyloRunWorkflowId` actually can not ever be
 * undefined if it shows up in the table, but according to the TS type for the
 * row item, it could be missing/undefined. In either case, downstream event
 * sending handles what to do when one/both undefined.
 */
function analyticsGetData(phyloRun: PhyloRun) {
  const { phyloTree, id } = phyloRun;

  return {
    treeId: phyloTree?.id,
    phyloRunWorkflowId: id,
  };
}

export default TreeTableDownloadMenu;
