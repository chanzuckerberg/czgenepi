import { Header } from "@tanstack/react-table";
import { CSSProperties, ReactNode } from "react";
import { TooltipText, TooltipTextType } from "./components/TooltipText";
import { StyledCellHeader } from "./style";

interface SortableProps {
  header: Header<any, any>;
  children: ReactNode & string;
  tooltipStrings?: TooltipTextType;
  style?: CSSProperties;
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
    <StyledCellHeader
      key={header.id}
      onClick={onClick}
      direction={sortDirection}
      active={Boolean(sortDirection)}
      hideSortIcon={!sortable}
      shouldShowTooltipOnHover={shouldShowTooltip}
      tooltipProps={{
        arrow: true,
        sdsStyle: "light",
        title: <TooltipText tooltipStrings={tooltipStrings} />,
        enterDelay: 1000,
      }}
      {...props}
    >
      {children}
    </StyledCellHeader>
  );
};
