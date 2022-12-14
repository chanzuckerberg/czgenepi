/* eslint-disable react/display-name */

import { ChipProps, Icon } from "czifui";
import {
  defaultSampleCellRenderer,
  defaultTreeCellRenderer,
} from "src/common/components/library/data_table";
import {
  Cell,
  RowContent,
  TreeRowContent,
} from "src/common/components/library/data_table/style";
import { createTableCellRenderer } from "src/common/utils";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { CZ_BIOHUB_GROUP } from "src/views/Data/constants";
import { LineageTooltip } from "./components/SamplesView/components/SamplesTable/components/LineageTooltip";
import { TreeActionMenu } from "./components/TreesView/components/TreesTable/components/TreeActionMenu";
import TreeTableNameCell from "./components/TreesView/components/TreesTable/components/TreeTableNameCell";
import { TreeTypeTooltip } from "./components/TreesView/components/TreesTable/components/TreeTypeTooltip";
import {
  CenteredFlexContainer,
  GISAIDCell,
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
    label: "bad",
    status: "error",
  },
  success: {
    label: "good",
    status: "success",
  },
  warning: {
    label: "mediocre",
    status: "warning",
  },
  processing: {
    label: "processing",
    status: "pending",
  },
  failed: {
    label: "failed",
    status: "pending",
  },
};

const SAMPLE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  collectionLocation: ({ value }): JSX.Element => {
    const location = value.location ?? value.division;
    return (
      <RowContent>
        <Cell data-test-id="row-collectionLocation">{location}</Cell>
      </RowContent>
    );
  },
  gisaid: ({ value }) => {
    const { gisaid_id, status } = value as Sample["gisaid"];
    return (
      <RowContent>
        <GISAIDCell data-test-id="row-gisaid-id">
          {status}
          {gisaid_id && <Subtext>{gisaid_id}</Subtext>}
        </GISAIDCell>
      </RowContent>
    );
  },
  lineages: ({ value }): JSX.Element => {
    // for now we're assuming that each sample has only one lineage
    // SC2 has lineages from Pangolin, other pathogens are assigned lineages from Nextclade
    // If we start adding multiple lineages per sample we'll need to revisit this logic.
    const firstLineageValue = value[0];
    const hasLineage = Boolean(
      firstLineageValue && firstLineageValue.lineage_software_version
    );
    const Component = hasLineage ? UnderlinedRowContent : RowContent;

    const Content = (
      <Component>
        <Cell data-test-id="row-lineage">
          {(firstLineageValue && firstLineageValue.lineage) ||
            "Not Yet Processed"}
        </Cell>
      </Component>
    );

    return hasLineage ? (
      <LineageTooltip lineage={firstLineageValue}>{Content}</LineageTooltip>
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
    const { qcMetrics, private: isPrivate, submittingGroup, uploadedBy } = item;

    const label = () => {
      const qcStatus = qcMetrics[0]?.qc_status;
      if (qcStatus === "good") {
        return LABEL_STATUS.success;
      } else if (qcStatus === "bad") {
        return LABEL_STATUS.error;
      } else if (qcStatus === "mediocre") {
        return LABEL_STATUS.warning;
      } else if (qcStatus === "failed") {
        return LABEL_STATUS.failed;
      } else {
        return LABEL_STATUS.processing;
      }
    };

    const displayName =
      submittingGroup?.name === CZ_BIOHUB_GROUP
        ? "CZ Biohub"
        : uploadedBy?.name;

    return (
      <RowContent>
        <Cell>
          <SampleIconWrapper>
            {isPrivate ? (
              <Icon
                sdsIcon="flaskPrivate"
                sdsSize="xl"
                sdsType="static"
                data-test-id="row-is-private"
              />
            ) : (
              <Icon
                sdsIcon="flaskPublic"
                sdsSize="xl"
                sdsType="static"
                data-test-id="row-is-public"
              />
            )}
          </SampleIconWrapper>
          <PrivateIdValueWrapper>
            <CenteredFlexContainer>
              <span data-test-id="row-private-id">{value}</span>
              <StyledChip
                data-test-id="row-sample-status"
                size="small"
                label={label()?.label}
                status={label()?.status}
              />
            </CenteredFlexContainer>
            <StyledUploaderName data-test-id="row-user-name">
              {displayName}
            </StyledUploaderName>
          </PrivateIdValueWrapper>
        </Cell>
      </RowContent>
    );
  },

  uploadDate: ({ value }): JSX.Element => {
    return (
      <RowContent data-test-id={`row-upload-date`}>
        {datetimeWithTzToLocalDate(value)}
      </RowContent>
    );
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
    onDeleteTreeModalOpen,
    onEditTreeModalOpen,
  }): JSX.Element => {
    return (
      <TreeActionMenu
        item={item}
        value={value}
        onDeleteTreeModalOpen={onDeleteTreeModalOpen}
        onEditTreeModalOpen={onEditTreeModalOpen}
      />
    );
  },
  name: TreeTableNameCell,
  startedDate: ({ value, header }): JSX.Element => {
    const dateNoTime = datetimeWithTzToLocalDate(value.split(" ")[0]);
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
          {String(value)}
        </UnderlinedCell>
      </TreeRowContent>
    </TreeTypeTooltip>
  ),
};

export const TreeRenderer = createTableCellRenderer(
  TREE_CUSTOM_RENDERERS,
  defaultTreeCellRenderer
);
