import { get, isEqual } from "lodash/fp";
import React, { Fragment, FunctionComponent, useReducer } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { ReactComponent as SortArrowDownIcon } from "src/common/icons/IconArrowDownSmall.svg";
import { ReactComponent as SortArrowUpIcon } from "src/common/icons/IconArrowUpSmall.svg";
import { EmptyState } from "../data_subview/components/EmptyState";
import style from "./index.module.scss";
import { RowContent, TableRow } from "./style";

interface Props {
  data?: TableItem[];
  headers: Header[];
  defaultSortKey: string[];
  isLoading: boolean;
  renderer?: CustomRenderer;
  headerRenderer?: HeaderRenderer;
}

// (thuang): If item height changes, we need to update this value!
const ITEM_HEIGHT_PX = 60;

const LOADING_STATE_ROW_COUNT = 10;

const UNDEFINED_TEXT = "---";

export function defaultCellRenderer({
  value,
}: CustomTableRenderProps): JSX.Element {
  const displayData = value || UNDEFINED_TEXT;

  return (
    <RowContent>
      <div className={style.cell}>{displayData}</div>
    </RowContent>
  );
}

export function defaultHeaderRenderer({
  header,
}: HeaderRendererProps): JSX.Element {
  return (
    <div key={header.key} className={style.headerCell}>
      <div className={style.headerCellContent}>{header.text}</div>
    </div>
  );
}

function sortData(
  data: TableItem[],
  sortKey: string[],
  ascending: boolean
): TableItem[] {
  return data.sort((a, b): number => {
    let order = String(get(sortKey, a)).localeCompare(String(get(sortKey, b)));
    if (!ascending) {
      order = order * -1;
    }
    return order;
  });
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
  headerRenderer = defaultHeaderRenderer,
  renderer = defaultCellRenderer,
  isLoading,
}: Props) => {
  const [state, dispatch] = useReducer(
    reducer,
    { ascending: false, sortKey: defaultSortKey }
  );

  const indexingKey = headers[0].key;

  const handleSortClick = (newSortKey: string[]) => {
    let ascending = false;
    if (isEqual(newSortKey, state.sortKey)) {
      ascending = !state.ascending;
    }
    dispatch({
      ascending: ascending,
      sortKey: newSortKey
    });
  };

  // render functions
  const headerRow = headers.map((header: Header, index) => {
    const headerJSX = headerRenderer({ header, index });
    let sortIndicator: JSX.Element | null = null;
    if (isEqual(header.sortKey, state.sortKey)) {
      sortIndicator = <SortArrowDownIcon />;
      if (state.ascending) {
        sortIndicator = <SortArrowUpIcon />;
      }
    }
    return (
      <div
        onClick={() => handleSortClick(header.sortKey)}
        key={header.sortKey.join("-")}
        className={style.headerMetaCell}
      >
        {headerJSX}
        {sortIndicator}
      </div>
    );
  });

  const sampleRow = (item: TableItem): React.ReactNode => {
    if (isLoading) {
      return <EmptyState numOfColumns={headers.length} />;
    }

    return headers.map((header, index) => {
      const value = item[header.key];

      return (
        <Fragment key={`${item[indexingKey]}-${header.key}`}>
          {renderer({ header, index, item, value })}
        </Fragment>
      );
    });
  };

  const render = (tableData: TableItem[]) => {
    function renderRow(props: ListChildComponentProps) {
      const item = tableData[props.index];

      return <TableRow style={props.style}>{sampleRow(item)}</TableRow>;
    }
    return (
      <div className={style.container}>
        <div className={style.header}>{headerRow}</div>
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
  console.log(state)
  const sortedData = sortData(data, state.sortKey, state.ascending)
  return render(sortedData)
};
