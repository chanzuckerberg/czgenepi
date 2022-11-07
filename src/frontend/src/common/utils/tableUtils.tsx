// TODO-TR (mlila): delete this after samples table refactor
/* eslint-disable react/display-name */
import { UNDEFINED_TEXT } from "../components/library/data_table";

export function createTableCellRenderer(
  customRenderers: Record<string, CellRenderer>,
  defaultRenderer: CellRenderer
): CustomRenderer {
  return ({
    header,
    value,
    item,
    index,
    userInfo,
    onDeleteTreeModalOpen,
    onEditTreeModalOpen,
  }: CustomTableRenderProps) => {
    const unwrappedValue = value || UNDEFINED_TEXT;

    const renderer = customRenderers[header.key] || defaultRenderer;

    return renderer({
      header,
      index,
      item,
      onDeleteTreeModalOpen,
      onEditTreeModalOpen,
      userInfo,
      value: unwrappedValue,
    });
  };
}
