import { Column } from "@tanstack/react-table";
import { CSSProperties } from "react";
import { useSelector } from "react-redux";
import { UNDEFINED_TEXT } from "../components/library/data_table";
import { selectCurrentPathogen } from "../redux/selectors";

// TODO-TR (mlila): delete this after samples table refactor
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
    const pathogen = useSelector(selectCurrentPathogen);
    const unwrappedValue = value || UNDEFINED_TEXT;

    const renderer = customRenderers[header.key] || defaultRenderer;

    return renderer({
      header,
      index,
      item,
      onDeleteTreeModalOpen,
      onEditTreeModalOpen,
      pathogen,
      userInfo,
      value: unwrappedValue,
    });
  };
}

export const generateWidthStyles = (
  column: Column<any, any>
): CSSProperties => {
  return {
    width: `${column.getSize()}px`,
  };
};
