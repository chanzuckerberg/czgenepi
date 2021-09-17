/* eslint-disable react/display-name */

import { css } from "@emotion/css";
import { Link, Tooltip } from "czifui";
import React from "react";
import { defaultHeaderRenderer } from "src/common/components/library/data_table";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { createTableHeaderRenderer } from "src/common/utils";

const arrow = css`
  left: 0 !important;
`;

const LINEAGE_TOOLTIP_TEXT = (
  <div>
    <b>Lineage:</b> A lineage is a named group of related sequences. A few
    lineages have been associated with changes in the epidemiological or
    biological characteristics of the virus. We continually update these
    lineages based on the evolving Pangolin designations. Lineages determined by
    Pangolin.{" "}
    <Link
      href="https://cov-lineages.org/pangolin.html"
      target="_blank"
      rel="noopener"
    >
      Learn more.
    </Link>
  </div>
);

const TREE_TYPE_TOOLTIP_TEXT = (
  <div>
    <b>Tree Type:</b> Aspen-defined profiles for tree building based on primary
    use case and build settings.{" "}
    <Link
      href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing"
      target="_blank"
      rel="noopener"
    >
      Read our guide to learn more.
    </Link>
  </div>
);

const SampleRenderers: Record<string, HeaderRenderer> = {
  lineage: ({ header }): JSX.Element => (
    <div key={header.key} className={dataTableStyle.headerCell}>
      <Tooltip
        arrow
        classes={{ arrow }}
        title={LINEAGE_TOOLTIP_TEXT}
        placement="bottom-start"
      >
        <div className={dataTableStyle.headerCellContent}>{header.text}</div>
      </Tooltip>
    </div>
  ),
};

const TreeRenderers: Record<string, HeaderRenderer> = {
  treeType: ({ header }): JSX.Element => (
    <div key={header.key} className={dataTableStyle.headerCell}>
      <Tooltip
        arrow
        classes={{ arrow }}
        title={TREE_TYPE_TOOLTIP_TEXT}
        placement="bottom-start"
      >
        <div className={dataTableStyle.headerCellContent}>{header.text}</div>
      </Tooltip>
    </div>
  ),
};

export const SampleHeader = createTableHeaderRenderer(
  SampleRenderers,
  defaultHeaderRenderer
);

export const TreeHeader = createTableHeaderRenderer(
  TreeRenderers,
  defaultHeaderRenderer
);
