/* eslint-disable react/display-name */

import React from "react";

import { Modal } from "common/components";
import { createTableCellRenderer, createTreeModalInfo } from "common/utils";
import { ReactComponent as SampleIcon } from "common/icons/Sample.svg";
import { ReactComponent as TreeIcon } from "common/icons/PhyloTree.svg";
import { ReactComponent as ExternalLinkIcon } from "common/icons/ExternalLink.svg";

import style from "./index.module.scss";

const DEFAULT_RENDERER = (value: JSONPrimitive, item: Record<string | number, JSONPrimitive>, _index: number): JSX.Element => {
    return <div className={style.cell}>{value}</div>
}

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

const SampleRenderer = createTableCellRenderer(SAMPLE_CUSTOM_RENDERERS, DEFAULT_RENDERER);


const TREE_CUSTOM_RENDERERS: Record<string | number, CellRenderer> = {
    name: (value: JSONPrimitive, item: Record<string | number, JSONPrimitive>, _index: number): JSX.Element => {
        return (
                <Modal data={createTreeModalInfo("")} className={style.cell}>
                    {<TreeIcon className={style.icon} />}
                    {value}
                    {<ExternalLinkIcon className={style.icon} />}
                </Modal>
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

const TreeRenderer = createTableCellRenderer(TREE_CUSTOM_RENDERERS, DEFAULT_RENDERER);

export { SampleRenderer, TreeRenderer };
