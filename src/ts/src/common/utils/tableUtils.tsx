import React from "react";

const UNDEFINED_TEXT = "---";

function createTableCellRenderer(
    customRenderers: Record<string | number, CellRenderer>,
    customStyle?: Stylesheet
): CustomRenderer {
    const renderer: CustomRenderer = ({
        value,
        header,
        index,
    }: CustomTableRenderProps) => {
        let unwrappedValue;
        if (value === undefined) {
            unwrappedValue = UNDEFINED_TEXT;
        } else {
            unwrappedValue = value;
        }

        if (customRenderers[header.key] !== undefined) {
            const cellRenderFunction = customRenderers[header.key];
            return cellRenderFunction(unwrappedValue, index);
        }

        return <div className={customStyle?.cell}>{unwrappedValue}</div>;
    };
    return renderer;
}

export { createTableCellRenderer };
