import { get, isEqual } from "lodash/fp";
import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { noop } from "src/common/constants/empty";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { EmptyState } from "../data_subview/components/EmptyState";
import { HeaderRow } from "./components/HeaderRow";
import style from "./index.module.scss";
import { RowCheckbox, RowContent, TableRow } from "./style";

interface Props {
  data?: TableItem[];
  headers: Header[];
  defaultSortKey: string[];
  isLoading: boolean;
  checkedSamples: any[];
  setCheckedSamples(samples: string[]): void;
  failedSamples: any[];
  setFailedSamples(samples: string[]): void;
  showCheckboxes: boolean;
  renderer?: CustomRenderer;
}

// (thuang): If item height changes, we need to update this value!
const ITEM_HEIGHT_PX = 60;

const LOADING_STATE_ROW_COUNT = 10;

const UNDEFINED_TEXT = "-";

export function defaultCellRenderer({
  value,
  header,
}: CustomTableRenderProps): JSX.Element {
  const displayData = value || UNDEFINED_TEXT;

  return (
    <RowContent header={header}>
      <div className={style.cell} data-test-id={`row-${header.key}`}>
        {displayData}
      </div>
    </RowContent>
  );
}

function defaultSorting(a: TableItem, b: TableItem, sortKey: string[]) {
  return String(get(sortKey, a)).localeCompare(String(get(sortKey, b)));
}

function sortData(
  data: TableItem[],
  sortKey: string[],
  ascending: boolean
): TableItem[] {
  return data.sort((a, b): number => {
    let order = 0;
    // Keep failed samples at the bottom of the table
    if (sortKey[0] === "uploadDate") {
      const uploadDateAIsNull = a["uploadDate"] === null;
      const uploadDateBIsNull = b["uploadDate"] === null;
      if (uploadDateAIsNull && uploadDateBIsNull) {
        order = 0;
      } else if (uploadDateAIsNull && !uploadDateBIsNull) {
        order = -1;
      } else if (uploadDateBIsNull && !uploadDateAIsNull) {
        order = 1;
      } else {
        order = defaultSorting(a, b, sortKey);
      }
    } else {
      order = defaultSorting(a, b, sortKey);
    }

    if (!ascending) {
      return order * -1;
    } else {
      return order;
    }
  });
}

function extractPublicIdsFromData(
  data: TableItem[],
  checkedSamples: string[],
  onlyCheckedSamples: boolean
): string[] {
  const publicIds: string[] = [];
  for (const key in data) {
    const id = String(data[key as any].publicId);
    if (onlyCheckedSamples) {
      if (checkedSamples.includes(id)) {
        publicIds.push(id);
      }
    } else {
      publicIds.push(id);
    }
  }
  return publicIds;
}

function extractPublicIdsFromDataWFailedGenomeRecovery(data: TableItem[]) {
  const failedSamples: string[] = [];
  for (const key in data) {
    if (data[key as any].CZBFailedGenomeRecovery) {
      failedSamples.push(String(data[key as any].publicId));
    }
  }
  return failedSamples;
}

interface TableState {
  sortKey: string[];
  ascending: boolean;
}

function reducer(state: TableState, action: TableState) {
  return { ...state, ...action };
}

export const DataTable: FunctionComponent<Props> = ({
  data,
  headers,
  defaultSortKey,
  renderer = defaultCellRenderer,
  isLoading,
  checkedSamples,
  setCheckedSamples,
  failedSamples,
  setFailedSamples,
  showCheckboxes,
}: Props) => {
  const [isHeaderChecked, setIsHeaderChecked] = useState<boolean>(false);
  const [isHeaderIndeterminant, setHeaderIndeterminant] =
    useState<boolean>(false);
  const [state, dispatch] = useReducer(reducer, {
    ascending: false,
    sortKey: defaultSortKey,
  });

  useEffect(() => {
    // used to determine if header is indeterminate
    if (data) {
      const publicIds = extractPublicIdsFromData(data, checkedSamples, true);
      const sizeData = Object.keys(data).length;
      if (publicIds.length === sizeData || publicIds.length === 0) {
        setHeaderIndeterminant(false);
      } else {
        setHeaderIndeterminant(true);
      }
      if (publicIds.length > 0 && publicIds.length !== sizeData) {
        setIsHeaderChecked(false);
      }
      if (publicIds.length === sizeData) {
        setIsHeaderChecked(true);
      }
      if (sizeData === 0) {
        setIsHeaderChecked(false);
      }
    }
  }, [data, checkedSamples, setHeaderIndeterminant, setIsHeaderChecked]);

  function handleHeaderCheckboxClick() {
    if (!data) return;

    const newPublicIds = extractPublicIdsFromData(data, checkedSamples, false);
    const newFailedIds = extractPublicIdsFromDataWFailedGenomeRecovery(data);

    if (isHeaderIndeterminant || isHeaderChecked) {
      // remove samples in current data selection when selecting checkbox when indeterminate
      const newCheckedSamples = checkedSamples.filter(
        (el) => !newPublicIds.includes(el)
      );
      const newFailedSamples = failedSamples.filter(
        (el) => !newFailedIds.includes(el)
      );
      setCheckedSamples(newCheckedSamples);
      setFailedSamples(newFailedSamples);
      setIsHeaderChecked(false);
      setHeaderIndeterminant(false);
    }
    if (!isHeaderChecked && !isHeaderIndeterminant) {
      // set isHeaderChecked to true, add all samples in current view
      setCheckedSamples(checkedSamples.concat(newPublicIds));
      setFailedSamples(failedSamples.concat(newFailedIds));
      setIsHeaderChecked(true);
    }
  }

  function handleRowCheckboxClick(
    sampleId: string,
    failedGenomeRecovery: boolean
  ) {
    if (checkedSamples.includes(sampleId)) {
      setCheckedSamples(checkedSamples.filter((id) => id !== sampleId));
      if (failedGenomeRecovery) {
        setFailedSamples(failedSamples.filter((id) => id !== sampleId));
      }
    } else {
      setCheckedSamples([...checkedSamples, sampleId]);
      if (failedGenomeRecovery) {
        setFailedSamples([...failedSamples, sampleId]);
      }
    }
  }

  const indexingKey = headers[0].key;

  const handleSortClick = (newSortKey: string[]) => {
    let ascending = false;
    if (isEqual(newSortKey, state.sortKey)) {
      ascending = !state.ascending;
    }
    dispatch({
      ascending: ascending,
      sortKey: newSortKey,
    });
  };

  // render functions
  const sampleRow = (item: TableItem): React.ReactNode => {
    return headers.map((header, index) => {
      const value = item[header.key];

      return (
        <Fragment key={`${item[indexingKey]}-${header.key}`}>
          {renderer({ header, index, item, value })}
        </Fragment>
      );
    });
  };

  const rowCheckbox = (item: TableItem): React.ReactNode => {
    const checked: boolean = checkedSamples.includes(item?.publicId);
    const handleClick = function handleClick() {
      handleRowCheckboxClick(
        String(item.publicId),
        Boolean(item.CZBFailedGenomeRecovery)
      );
    };
    return (
      <RowCheckbox
        onChange={item ? handleClick : noop}
        checked={checked}
        stage={checked ? "checked" : "unchecked"}
      />
    );
  };

  const render = (tableData: TableItem[]) => {
    if (usesFeatureFlag(FEATURE_FLAGS.mayasFlag)) {
      return <div>FEATURE FLAG IN USE...</div>;
    }

    function renderRow(props: ListChildComponentProps) {
      const item = tableData[props.index];
      return (
        <TableRow style={props.style} data-test-id="table-row">
          {showCheckboxes && rowCheckbox(item)}
          {item ? (
            sampleRow(item)
          ) : (
            <EmptyState numOfColumns={headers.length} />
          )}
        </TableRow>
      );
    }

    return (
      <div className={style.container}>
        <HeaderRow
          handleHeaderCheckboxClick={handleHeaderCheckboxClick}
          handleSortClick={handleSortClick}
          headers={headers}
          isHeaderChecked={isHeaderChecked}
          isHeaderIndeterminant={isHeaderIndeterminant}
          isSortedAscending={state.ascending}
          shouldShowCheckboxes={showCheckboxes}
          sortColKey={state.sortKey}
        />
        <div className={style.tableContent}>
          <AutoSizer>
            {({ height, width }) => {
              return (
                <FixedSizeList
                  height={height}
                  itemData={tableData}
                  itemCount={
                    isLoading ? LOADING_STATE_ROW_COUNT : tableData.length
                  }
                  itemSize={ITEM_HEIGHT_PX}
                  width={width}
                >
                  {renderRow}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        </div>
      </div>
    );
  };

  if (data === undefined) {
    return render([]);
  }

  const sortedData = sortData(data, state.sortKey, state.ascending);
  return render(sortedData);
};
