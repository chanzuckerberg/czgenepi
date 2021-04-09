/* eslint-disable react/display-name */

import React from "react";
import { ReactComponent as TreeIcon } from "src/common/icons/PhyloTree.svg";
import { ReactComponent as SampleIcon } from "src/common/icons/Sample.svg";
import { createTableCellRenderer } from "src/common/utils";
import style from "./index.module.scss";

const SAMPLE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  privateId: (value: JSONPrimitive): JSX.Element => {
    return (
      <div className={style.cell}>
        {<SampleIcon className={style.icon} />}
        {value}
      </div>
    );
  },
};

const SampleRenderer = createTableCellRenderer(SAMPLE_CUSTOM_RENDERERS, style);

const TREE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
  downloadLink: (value: JSONPrimitive): JSX.Element => (
    <div className={style.cell}>
      <a href={`${value}`} download>
        Download
      </a>
    </div>
  ),
  name: (value: JSONPrimitive): JSX.Element => {
    return (
      <div className={style.cell}>
        {<TreeIcon className={style.icon} />}
        {value}
      </div>
    );
  },
};

const TreeRenderer = createTableCellRenderer(TREE_CUSTOM_RENDERERS, style);

export { SampleRenderer, TreeRenderer };
