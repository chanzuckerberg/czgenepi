import { isEqual } from "lodash";
import { TableHeader } from "./components/TableHeader";
import { HeaderCheckbox, StyledHeaderRow } from "./style";

interface Props {
  handleHeaderCheckboxClick(): void;
  handleSortClick(key: string[]): void;
  headers: Header[];
  isHeaderChecked: boolean;
  isHeaderIndeterminant: boolean;
  isSortedAscending: boolean;
  isSampleTable: boolean;
  sortColKey: string[];
}

const HeaderRow = ({
  handleHeaderCheckboxClick,
  handleSortClick,
  headers,
  isHeaderChecked,
  isHeaderIndeterminant,
  isSortedAscending,
  isSampleTable,
  sortColKey,
}: Props): JSX.Element => (
  <StyledHeaderRow
    data-test-id="header-row"
    shouldShowCheckboxes={isSampleTable}
  >
    {isSampleTable && (
      <HeaderCheckbox
        checked={isHeaderChecked}
        onClick={handleHeaderCheckboxClick}
        stage={
          isHeaderIndeterminant
            ? "indeterminate"
            : isHeaderChecked
            ? "checked"
            : "unchecked"
        }
      />
    )}
    {headers.map((header: Header) => {
      const { key, sortKey } = header;

      return (
        <TableHeader
          header={header}
          key={key}
          onClick={() => handleSortClick(sortKey)}
          doesSortOnThisCol={isEqual(sortKey, sortColKey)}
          isSortedAscending={isSortedAscending}
          isSampleTable={isSampleTable}
        />
      );
    })}
  </StyledHeaderRow>
);

export { HeaderRow };
