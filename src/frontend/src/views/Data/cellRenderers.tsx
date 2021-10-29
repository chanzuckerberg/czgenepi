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
import style from "./index.module.scss";
import {
  GISAIDCell,
  PrivacyIcon,
  PrivateIdValueWrapper,
  SampleIconWrapper,
  StyledChip,
  Subtext,
  UnderlinedCell,
  UnderlinedRowContent,
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

    const Component = hasLineage ? UnderlinedRowContent : RowContent;

    const Content = (
      <Component>
        <UnderlinedCell className={dataTableStyle.cell}>
          {value.lineage || "Not Yet Processed"}
        </UnderlinedCell>
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

  // Preferably, we would just use defaultCellRenderer for this column, but we want
  // to intercept its value and change it out in some cases before rendering.
  sequencingDate: ({ header, value }): JSX.Element => {
    let displayValue = value;
    if (value === "N/A") {
      displayValue = "-";
    }
    // defaultCellRenderer only uses `value` and `header` but its input type asks
    // for more than that, so just forcing typescript to be cool.
    return defaultCellRenderer({
      header,
      value: displayValue,
    } as CustomTableRenderProps);
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
  startedDate: ({ value, header }): JSX.Element => {
    const dateNoTime = value.split(" ")[0];
    return (
      <RowContent header={header}>
        <div className={style.cell} data-test-id={`row-${header.key}`}>
          {dateNoTime}
        </div>
      </RowContent>
    );
  },
  treeType: ({ value, header }: CustomTableRenderProps): JSX.Element => (
    <TreeTypeTooltip value={value as string}>
      <UnderlinedRowContent header={header}>
        <UnderlinedCell data-test-id={`row-${header.key}`}>
          {value}
        </UnderlinedCell>
      </UnderlinedRowContent>
    </TreeTypeTooltip>
  ),
};

export const TreeRenderer = createTableCellRenderer(
  TREE_CUSTOM_RENDERERS,
  defaultCellRenderer
);
