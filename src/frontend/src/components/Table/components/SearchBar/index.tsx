import { InputSearch } from "czifui";
import { escapeRegExp, filter } from "lodash";
import { ChangeEvent, useEffect, useState } from "react";

// TODO-TR (mlila): types
interface Props {
  onSearchComplete(filteredRows: any): void;
  tableData: any;
}

const SearchBar = ({ onSearchComplete, tableData }: Props): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // if there's an update to the table data, rerun the search
  useEffect(() => {
    onSearchChange({
      target: {
        value: searchQuery,
      }
    } as ChangeEvent<HTMLInputElement>);
  }, [tableData]);

  /**
   * Does a deep search of the given object. Checks if primitives are an exact match of the search
   * term. For objects, checks if any of the values (at any level of nesting) match the search term.
   * @param tableRowItem - The primitive or object being searched
   * @param searchQuery - The search query from the search input
   * @returns true if any data in the row contains the search term. Returns false otherwise.
   */
  const deepTableRowItemSearch = (
    // TODO-TR (mlila): types
    tableRowItem: any,
    searchQuery: RegExp
  ): boolean => {
    return Object.values(tableRowItem).some((value) => {
      if (typeof value === "object" && value !== null) {
        return deepTableRowItemSearch(value, searchQuery);
      }
      return searchQuery.test(`${value}`);
    });
  }

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const query = event?.target?.value;
    setSearchQuery(query);

    if (tableData === undefined) {
      // if there isn't any table data, don't try to search
      return;
    } else if (query?.length === 0) {
      // if there's no search term, return all rows
      onSearchComplete(Object.values(tableData));
      return;
    }

    // there is data in the table AND a search query -- execute a search
    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredData = filter(tableData, (item) => deepTableRowItemSearch(item, regex))

    onSearchComplete(filteredData);
  };

  return (
    <InputSearch
      id="search-samples"
      label="search samples"
      sdsStyle="rounded"
      placeholder="Search"
      onChange={onSearchChange}
      value={searchQuery}
      data-test-id="search-samples"
    />
  );
};

export { SearchBar };
