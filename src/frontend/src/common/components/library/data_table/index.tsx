/* eslint-disable sonarjs/cognitive-complexity */
/** TODO: Re-evaluate if there really is a complexity problem here **/
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
import SortArrowDownIcon from "src/common/icons/IconArrowDownSmall.svg";
import SortArrowUpIcon from "src/common/icons/IconArrowUpSmall.svg";
import { EmptyState } from "../data_subview/components/EmptyState";
import style from "./index.module.scss";
import { HeaderCheckbox, RowCheckbox, RowContent, TableRow } from "./style";

interface Props {
  data?: TableItem[];
  headers: Header[];
  defaultSortKey: string[];
  isLoading: boolean;
  checkedSamples: any[];
  isHeaderChecked: boolean;
  showCheckboxes: boolean;
  handleHeaderCheckboxClick(): void;
  handleRowCheckboxClick(sampleId: string): void;
  renderer?: CustomRenderer;
  headerRenderer?: HeaderRenderer;
}

// (thuang): If item height changes, we need to update this value!
const ITEM_HEIGHT_PX = 60;

const LOADING_STATE_ROW_COUNT = 10;

const UNDEFINED_TEXT = "---";

export function defaultCellRenderer({
  value,
  header,
}: CustomTableRenderProps): JSX.Element {
  const displayData = value || UNDEFINED_TEXT;

  return (
    <RowContent>
      <div className={style.cell} data-test-id={`row-${header.key}`}>
        {displayData}
      </div>
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
  checkedSamples,
  showCheckboxes,
  handleHeaderCheckboxClick,
  handleRowCheckboxClick,
  isHeaderChecked,
}: Props) => {
  const [state, dispatch] = useReducer(reducer, {
    ascending: false,
    sortKey: defaultSortKey,
  });

  const [isHeaderDisabled, setHeaderDisabled] = useState(false);

  useEffect(() => {
    // determine if mixed state (user has custom selected samples)
    if (data) {
      const sizeData: number = Object.keys(data).length;
      if (checkedSamples.length === 0 || checkedSamples.length === sizeData) {
        setHeaderDisabled(false);
      } else {
        setHeaderDisabled(true);
      }
    }
  }, [checkedSamples]);

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
        data-test-id="header-cell"
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

  const headerCheckbox = (): React.ReactNode => {
    function handleClick() {
      handleHeaderCheckboxClick();
    }
    return (
      <HeaderCheckbox
        color="primary"
        checked={isHeaderChecked}
        onClick={handleClick}
        // disabled={isHeaderDisabled}
        disabled={false}
        indeterminate={isHeaderDisabled}
      />
    );
  };

  const rowCheckbox = (item: TableItem): React.ReactNode => {
    let handleClick;
    if (item !== undefined) {
      const checked: boolean = checkedSamples.includes(item.privateId);
      handleClick = function handleClick() {
        handleRowCheckboxClick(item.privateId.toString());
      };
      return (
        <RowCheckbox
          color="primary"
          onClick={handleClick}
          checked={checked || isHeaderChecked}
        />
      );
    }
  };

  const render = (tableData: TableItem[]) => {
    function renderRow(props: ListChildComponentProps) {
      const item = tableData[props.index];
      return (
        <TableRow style={props.style} data-test-id="table-row">
          {showCheckboxes && rowCheckbox(item)}
          {item === undefined ? null : sampleRow(item)}
        </TableRow>
      );
    }

    return (
      <div className={style.container}>
        <div className={style.header} data-test-id="header-row">
          {showCheckboxes && headerCheckbox()}
          {headerRow}
        </div>
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
