/* eslint-disable react/display-name */

import { Lock, Public } from "@material-ui/icons";
import { ChipProps, Tooltip } from "czifui";
import React from "react";
import { defaultCellRenderer } from "src/common/components/library/data_table";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { RowContent } from "src/common/components/library/data_table/style";
import { TREE_STATUS } from "src/common/constants/types";
import SampleIcon from "src/common/icons/Sample.svg";
import { createTableCellRenderer, stringGuard } from "src/common/utils";
import TreeTableDownloadMenu from "src/components/TreeTableDownloadMenu";
import { Lineage, LineageTooltip } from "./components/LineageTooltip";
import TreeTableNameCell from "./components/TreeTableNameCell";
import { TreeTypeTooltip } from "./components/TreeTypeTooltip";
import {
  GISAIDCell,
  LineageCell,
  LineageRowContent,
  PrivacyIcon,
  PrivateIdValueWrapper,
  SampleIconWrapper,
  StyledChip,
  Subtext,
} from "./style";

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
          {status}
          {gisaid_id && <Subtext>{gisaid_id}</Subtext>}
        </GISAIDCell>
      </RowContent>
    );
  },
  lineage: ({ value }): JSX.Element => {
    const hasLineage = Boolean(value.version);

    const Component = hasLineage ? LineageRowContent : RowContent;

    const Content = (
      <Component>
        <LineageCell className={dataTableStyle.cell}>
          {value.lineage || "Not Yet Processed"}
        </LineageCell>
      </Component>
    );

    return hasLineage ? (
      <Tooltip title={<LineageTooltip lineage={value as Lineage} />}>
        {Content}
      </Tooltip>
    ) : (
      Content
    );
  },

  privateId: ({
    value,
    item,
  }: {
    value: string;
    item: Sample;
  }): JSX.Element => {
    const { CZBFailedGenomeRecovery, private: isPrivate } = item;
    const label = CZBFailedGenomeRecovery
      ? LABEL_STATUS.error
      : LABEL_STATUS.success;

    return (
      <RowContent>
        <div className={dataTableStyle.cell}>
          <SampleIconWrapper>
            <SampleIcon className={dataTableStyle.icon} />
            <PrivacyIcon>
              {isPrivate ? (
                <Lock color="primary" />
              ) : (
                <Public color="primary" />
              )}
            </PrivacyIcon>
          </SampleIconWrapper>
          <PrivateIdValueWrapper>
            {value}
            <StyledChip
              data-test-id="sample-status"
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

export const SampleRenderer = createTableCellRenderer(
  SAMPLE_CUSTOM_RENDERERS,
  defaultCellRenderer
);

const TREE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  downloadLink: ({ value, item }): JSX.Element => {
    const jsonDownloadLink = stringGuard(value);
    const tsvDownloadLink = stringGuard(item["accessionsLink"]);
    const shouldAllowDownload = item?.status === TREE_STATUS.Completed;
    return (
      <RowContent>
        <TreeTableDownloadMenu
          jsonLink={jsonDownloadLink}
          accessionsLink={tsvDownloadLink}
          shouldAllowDownload={shouldAllowDownload}
        />
      </RowContent>
    );
  },
  name: TreeTableNameCell,
  treeType: ({ value, header }: CustomTableRenderProps): JSX.Element => (
    <TreeTypeTooltip value={value as string}>
      <RowContent header={header}>
        <div data-test-id={`row-${header.key}`}>{value}</div>
      </RowContent>
    </TreeTypeTooltip>
  ),
};

export const TreeRenderer = createTableCellRenderer(
  TREE_CUSTOM_RENDERERS,
  defaultCellRenderer
);
