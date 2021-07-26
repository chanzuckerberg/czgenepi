import { memoize } from "lodash/fp";
import { ModalInfo } from "../types/ui";
import { createConfirmButton } from "./TreeModal/ConfirmButton";
import { createDownloadButton } from "./DownloadModal/DownloadButton"
import { Checkbox } from "semantic-ui-react";
import {Checkbox as CheckboxCZIFUI } from "czifui";

/* eslint-disable react/display-name */

const UNDEFINED_TEXT = "---";

export function createTableCellRenderer(
  customRenderers: Record<string, CellRenderer>,
  defaultRenderer: CellRenderer
): CustomRenderer {
  return ({ header, value, item, index }: CustomTableRenderProps) => {
    const unwrappedValue = value || UNDEFINED_TEXT;

    const renderer = customRenderers[header.key] || defaultRenderer;

    return renderer({
      header,
      index,
      item,
      value: unwrappedValue,
    });
  };
}

export function createTableHeaderRenderer(
  customRenderers: Record<string, HeaderRenderer>,
  defaultRenderer: HeaderRenderer
): CustomRenderer {
  return ({ header, index }: CustomTableRenderProps): JSX.Element => {
    const renderer = customRenderers[header.key] || defaultRenderer;

    return renderer({
      header,
      index,
    });
  };
}

export const createTreeModalInfo = memoize(createTreeModalInfo_);

function createTreeModalInfo_(treeId: number): ModalInfo {
  return {
    body:
      "You are leaving Aspen and sending your data to a private " +
      "visualization on Nextstrain, which is not controlled by Aspen.",
    buttons: [
      {
        Button: createConfirmButton(treeId),
      },
      {
        content: "Cancel",
        link: "cancel",
        type: "secondary",
      },
    ],
    header:
      "Please confirm you're ready to send your data to Nextstrain to see your tree.",
  };
}

export const createDownloadModalInfo = memoize(createDownloadModalInfo_);


function createDownloadModalInfo_(privateIds: Array[string]): ModalInfo {
  return {
    body:
      <>
      <CheckboxCZIFUI color="primary" /><text>Consensus Genome (consensus.fa) </text>
      <div>Download multiple consensus genomes in a single, concatenated file</div>
      <CheckboxCZIFUI color="primary" /><text>Sample Metadata (sample_metadata.tsv)</text>
      <div>Sample metadata including Private and Public IDs, Collection Date, Sequencing Date, Lineage, GISAID Status, and ISL Accession #.</div>
      </>,
    buttons: [
      {
        Button: createDownloadButton(privateIds),
      }
    ],
    header:
      "Select Download",
  };
}

