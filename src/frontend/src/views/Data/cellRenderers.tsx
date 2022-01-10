/* eslint-disable react/display-name */

import { Lock, Public } from "@material-ui/icons";
import { ChipProps, Tooltip } from "czifui";
import React from "react";
import {
  defaultSampleCellRenderer,
  defaultTreeCellRenderer,
} from "src/common/components/library/data_table";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import {
  RowContent,
  TreeRowContent,
} from "src/common/components/library/data_table/style";
import SampleIcon from "src/common/icons/Sample.svg";
import { createTableCellRenderer } from "src/common/utils";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { CZ_BIOHUB_GROUP } from "src/views/Data/constants";
import { Lineage, LineageTooltip } from "./components/LineageTooltip";
import { TreeActionMenu } from "./components/TreeActionMenu";
import TreeTableNameCell from "./components/TreeTableNameCell";
import { TreeTypeTooltip } from "./components/TreeTypeTooltip";
import {
  CenteredFlexContainer,
  GISAIDCell,
  PrivacyIcon,
  PrivateIdValueWrapper,
  SampleIconWrapper,
  StyledChip,
  StyledUploaderName,
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
  collectionLocation: ({ value }): JSX.Element => {
    const location = value.location ?? value.division;
    return (
      <RowContent>
        <div
          className={dataTableStyle.cell}
          data-test-id={`row-collectionLocation`}
        >
          {location}
        </div>
      </RowContent>
    );
  },
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
    const {
      CZBFailedGenomeRecovery,
      private: isPrivate,
      submittingGroup,
      uploadedBy,
    } = item;
    const label = CZBFailedGenomeRecovery
      ? LABEL_STATUS.error
      : LABEL_STATUS.success;

    const displayName =
      submittingGroup?.name === CZ_BIOHUB_GROUP
        ? "CZ Biohub"
        : uploadedBy?.name;

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
            <CenteredFlexContainer>
              <span>{value}</span>
              <StyledChip
                data-test-id="sample-status"
                size="small"
                label={label.label}
                status={label.status}
              />
            </CenteredFlexContainer>
            <StyledUploaderName>{displayName}</StyledUploaderName>
          </PrivateIdValueWrapper>
        </div>
      </RowContent>
    );
  },

  uploadDate: ({ value }): JSX.Element => {
    return <RowContent>{datetimeWithTzToLocalDate(value)}</RowContent>;
  },
};

export const SampleRenderer = createTableCellRenderer(
  SAMPLE_CUSTOM_RENDERERS,
  defaultSampleCellRenderer
);

const TREE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  actionMenu: ({
    value,
    item,
    userInfo,
    onDeleteTreeModalOpen,
  }): JSX.Element => {
    return (
      <TreeActionMenu
        item={item}
        value={value}
        userInfo={userInfo}
        onDeleteTreeModalOpen={onDeleteTreeModalOpen}
      />
    );
  },
  name: TreeTableNameCell,
  startedDate: ({ value, header }): JSX.Element => {
    const dateNoTime = value.split(" ")[0];
    return (
      <TreeRowContent header={header}>
        <div data-test-id={`row-${header.key}`}>{dateNoTime}</div>
      </TreeRowContent>
    );
  },
  treeType: ({ value, header }: CustomTableRenderProps): JSX.Element => (
    <TreeTypeTooltip value={value as string}>
      <TreeRowContent>
        <UnderlinedCell data-test-id={`row-${header.key}`}>
          {value}
        </UnderlinedCell>
      </TreeRowContent>
    </TreeTypeTooltip>
  ),
};

export const TreeRenderer = createTableCellRenderer(
  TREE_CUSTOM_RENDERERS,
  defaultTreeCellRenderer
);
