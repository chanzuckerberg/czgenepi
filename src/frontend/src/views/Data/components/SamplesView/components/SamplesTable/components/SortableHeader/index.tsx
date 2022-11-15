import { Header } from "@tanstack/react-table";
import { CellHeader } from "czifui";
import { ReactNode } from "react";
import { TooltipText, TooltipTextType } from "./components/TooltipText";

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
  const onClick = getToggleSortingHandler();
  const shouldShowTooltip = Boolean(tooltipStrings);

  return (
    <CellHeader
      onClick={onClick}
      direction={sortDirection}
      active={Boolean(sortDirection)}
      hideSortIcon={!sortable}
      shouldShowTooltipOnHover={shouldShowTooltip}
      tooltipProps={{
        arrow: true,
        sdsStyle: "light",
        title: <TooltipText tooltipStrings={tooltipStrings} />,
      }}
      {...props}
    >
      {children}
    </CellHeader>
  );
};
