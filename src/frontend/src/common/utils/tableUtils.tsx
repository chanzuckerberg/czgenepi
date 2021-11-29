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
