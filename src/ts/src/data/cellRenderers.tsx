/* eslint-disable react/display-name */

import React from "react";

import { createTableCellRenderer } from "common/utils";
import { ReactComponent as SampleIcon } from "common/icons/Sample.svg";
import { ReactComponent as TreeIcon } from "common/icons/PhyloTree.svg";

import style from "./index.module.scss";

const SAMPLE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
    privateId: (value: JSONPrimitive, item: Record<string | number, JSONPrimitive>, _index: number): JSX.Element => {
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
    name: (value: JSONPrimitive, item: Record<string | number, JSONPrimitive>, _index: number): JSX.Element => {
        return (
            <div className={style.cell}>
                {<TreeIcon className={style.icon} />}
                {value}
            </div>
        );
    },
    downloadLink: (value: JSONPrimitive, item: Record<string | number, JSONPrimitive>, _index: number): JSX.Element => (
        <div className={style.cell}>
            <a href={`${value}`} download>
                Download
            </a>
        </div>
    ),
};

const TreeRenderer = createTableCellRenderer(TREE_CUSTOM_RENDERERS, style);

export { SampleRenderer, TreeRenderer };
