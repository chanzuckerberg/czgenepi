/* eslint-disable react/display-name */

import { ChipProps, Tooltip } from "czifui";
import React from "react";
import { Modal } from "src/common/components";
import { defaultCellRenderer } from "src/common/components/library/data_table";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { RowContent } from "src/common/components/library/data_table/style";
import { ReactComponent as ExternalLinkIcon } from "src/common/icons/ExternalLink.svg";
import { ReactComponent as TreeIcon } from "src/common/icons/PhyloTree.svg";
import { ReactComponent as SampleIcon } from "src/common/icons/Sample.svg";
import {
  createTableCellRenderer,
  createTreeModalInfo,
  stringGuard,
} from "src/common/utils";
import TreeTableDownloadMenu from "src/components/TreeTableDownloadMenu";
import { Lineage, LineageTooltip } from "./components/LineageTooltip";
import {
  GISAIDCell,
  LineageCell,
  LineageRowContent,
  PrivateIdValueWrapper,
  StyledChip,
  Subtext,
} from "./style";
import { GISAID_STATUS_TO_TEXT } from "./utils/samples";

const LABEL_STATUS: Record<
  string,
  { label: string; status: NonNullable<ChipProps["status"]> }
> = {
  error: {
    label: "failed",
    status: "error",
  },
  success: {
    label: "complete",
    status: "success",
  },
};

const SAMPLE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  gisaid: ({ value }) => {
    const { gisaid_id, status } = value as Sample["gisaid"];

    return (
      <RowContent>
        <GISAIDCell className={dataTableStyle.cell}>
          {GISAID_STATUS_TO_TEXT[status]}
          {gisaid_id && <Subtext>{gisaid_id}</Subtext>}
        </GISAIDCell>
      </RowContent>
    );
  },
  lineage: ({ value }): JSX.Element => (
    <Tooltip title={<LineageTooltip lineage={value as Lineage} />}>
      <LineageRowContent>
        <LineageCell className={dataTableStyle.cell}>
          {value.lineage}
        </LineageCell>
      </LineageRowContent>
    </Tooltip>
  ),
  privateId: ({
    value,
    item,
  }: {
    value: string;
    item: Sample;
  }): JSX.Element => {
    const { CZBFailedGenomeRecovery } = item;
    const label = CZBFailedGenomeRecovery
      ? LABEL_STATUS.error
      : LABEL_STATUS.success;

    return (
      <RowContent>
        <div className={dataTableStyle.cell}>
          <SampleIcon className={dataTableStyle.icon} />
          <PrivateIdValueWrapper>
            {value}
            <StyledChip
              size="small"
              label={label.label}
              status={label.status}
            />
          </PrivateIdValueWrapper>
        </div>
      </RowContent>
    );
  },
};

const SampleRenderer = createTableCellRenderer(
  SAMPLE_CUSTOM_RENDERERS,
  defaultCellRenderer
);

const TREE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  downloadLink: ({ value, item }): JSX.Element => {
    const jsonDownloadLink = stringGuard(value);
    const tsvDownloadLink = stringGuard(item["accessionsLink"]);
    return (
      <RowContent>
        <TreeTableDownloadMenu
          jsonLink={jsonDownloadLink}
          accessionsLink={tsvDownloadLink}
        />
      </RowContent>
    );
  },
  name: ({ value }): JSX.Element => {
    const stringValue = stringGuard(value);

    const treeID = stringValue.split(" ")[0];
    return (
      <RowContent>
        <Modal
          data={createTreeModalInfo(treeID)}
          className={dataTableStyle.cell}
        >
          {<TreeIcon className={dataTableStyle.icon} />}
          {stringValue}
          {<ExternalLinkIcon className={dataTableStyle.icon} />}
        </Modal>
      </RowContent>
    );
  },
};

const TreeRenderer = createTableCellRenderer(
  TREE_CUSTOM_RENDERERS,
  defaultCellRenderer
);

export { SampleRenderer, TreeRenderer };
