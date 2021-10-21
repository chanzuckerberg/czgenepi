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
