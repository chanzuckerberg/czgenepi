import { ColumnDef } from "@tanstack/react-table";
import { CellComponent, CellHeader, InputCheckbox } from "czifui";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { StyledInputCheckbox } from "./style";

// Note: this is a React Table column definition, not a component
export const rowSelectionColumn: ColumnDef<any, any> = {
  id: "select",
  size: 40,
  minSize: 40,
  header: ({ table, column, header }) => {
    const {
      getIsAllRowsSelected,
      getIsSomeRowsSelected,
      getToggleAllRowsSelectedHandler,
    } = table;
    const isChecked = getIsAllRowsSelected();
    const isIndeterminate = getIsSomeRowsSelected();
    const checkboxStage = isChecked
      ? "checked"
      : isIndeterminate
      ? "indeterminate"
      : "unchecked";

    const onChange = getToggleAllRowsSelectedHandler();

    return (
      <CellHeader
        key={header.id}
        hideSortIcon
        style={generateWidthStyles(column)}
      >
        <StyledInputCheckbox stage={checkboxStage} onChange={onChange} />
      </CellHeader>
    );
  },
  cell: ({ row, cell }) => {
    const { getIsSelected, getToggleSelectedHandler } = row;

    const checkboxStage = getIsSelected() ? "checked" : "unchecked";
    const onChange = getToggleSelectedHandler();

    return (
      <CellComponent key={cell.id}>
        <InputCheckbox stage={checkboxStage} onChange={onChange} />
      </CellComponent>
    );
  },
};
