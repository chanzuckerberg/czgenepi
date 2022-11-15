import { Header } from "@tanstack/react-table";
import { CellHeader } from "czifui";
import { ReactNode } from "react";
import { TooltipText } from "./components/TooltipText";

interface SortableProps {
  header: Header<any, any>;
  children: ReactNode & string;
  tooltipStrings?: TooltipTextType;
}

export const SortableHeader = ({
  header,
  children,
  tooltipStrings,
  ...props
}: SortableProps): JSX.Element => {
  const { getCanSort, getIsSorted, getToggleSortingHandler } = header.column;

  const sortable = getCanSort();
  const sortDirection = getIsSorted() || undefined;
  const handler = getToggleSortingHandler();

  return (
    <CellHeader
      onClick={handler}
      direction={sortDirection}
      active={Boolean(sortDirection)}
      hideSortIcon={!sortable}
      shouldShowTooltipOnHover={Boolean(tooltipStrings)}
      tooltipProps={{
        arrow: false,
        sdsStyle: "light",
        title: <TooltipText tooltipStrings={tooltipStrings} />,
      }}
      {...props}
    >
      {children}
    </CellHeader>
  );
};
