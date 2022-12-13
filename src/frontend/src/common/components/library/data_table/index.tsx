import { get, isEqual } from "lodash/fp";
import {
  Fragment,
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { noop } from "src/common/constants/empty";
import { VIEWNAME } from "src/common/constants/types";
import { EmptyState } from "src/views/Data/components/EmptyState";
import { HeaderRow } from "./components/HeaderRow";
import {
  Cell,
  Container,
  RowCheckbox,
  RowContent,
  TableContent,
  TableRow,
  TreeRowContent,
} from "./style";

interface Props {
  data?: TableItem[];
  headers: Header[];
  defaultSortKey: string[];
  isLoading: boolean;
  checkedSampleIds: string[];
  setCheckedSampleIds(samples: string[]): void;
  failedSampleIds: string[];
  setBadQCSampleIds(samples: string[]): void;
  badQCSampleIds: string[];
  setFailedSampleIds(samples: string[]): void;
  viewName: VIEWNAME;
  renderer?: CustomRenderer;
  handleDeleteTreeModalOpen(t: PhyloRun): void;
  handleEditTreeModalOpen(t: PhyloRun): void;
}

// (thuang): If item height changes, we need to update this value!
export const ITEM_HEIGHT_PX = 68;

const LOADING_STATE_ROW_COUNT = 10;

export const UNDEFINED_TEXT = "-";

export function defaultSampleCellRenderer({
  value,
  header,
}: CustomTableRenderProps): JSX.Element {
  const displayData = value || UNDEFINED_TEXT;

  return (
    <RowContent header={header}>
      <Cell data-test-id={`row-${header.key}`}>{String(displayData)}</Cell>
    </RowContent>
  );
}

export function defaultTreeCellRenderer({
  value,
  header,
}: CustomTableRenderProps): JSX.Element {
  const displayData = value || UNDEFINED_TEXT;

  return (
    <TreeRowContent>
      <Cell data-test-id={`row-${header.key}`}>{String(displayData)}</Cell>
    </TreeRowContent>
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
    // Typically, DPH doesn't want to interact with failed samples.
    // As a result, we make extar efforts to keep failed samples at
    // the bottom of the table. For samples that have failed, we set
    // the upload date to null. Hence the special sort case here.
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
  checkedSampleIds: string[],
  onlyCheckedSamples: boolean
): string[] {
  const publicIds: string[] = [];
  for (const key in data) {
    const id = String(data[key as any].publicId);
    if (onlyCheckedSamples) {
      if (checkedSampleIds.includes(id)) {
        publicIds.push(id);
      }
    } else {
      publicIds.push(id);
    }
  }
  return publicIds;
}

function extractPublicIdsFromDataWFailedGenomeRecovery(data: TableItem[]) {
  const failedSampleIds: string[] = [];
  for (const key in data) {
    if (data[key as any].CZBFailedGenomeRecovery) {
      failedSampleIds.push(String(data[key as any].publicId));
    }
  }
  return failedSampleIds;
}

function extractPublicIdsWBadQCData(data: Sample[]) {
  return data
    .filter(
      (s) => s.qc_metrics.length > 0 && s.qc_metrics[0].qc_status === "bad"
    )
    .map((s) => s.publicId);
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
  renderer = defaultSampleCellRenderer,
  isLoading,
  checkedSampleIds,
  setCheckedSampleIds,
  failedSampleIds,
  setFailedSampleIds,
  setBadQCSampleIds,
  badQCSampleIds,
  viewName,
  handleDeleteTreeModalOpen,
  handleEditTreeModalOpen,
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
      const publicIds = extractPublicIdsFromData(data, checkedSampleIds, true);
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
  }, [data, checkedSampleIds, setHeaderIndeterminant, setIsHeaderChecked]);

  function handleHeaderCheckboxClick() {
    if (!data) return;

    const newPublicIds = extractPublicIdsFromData(
      data,
      checkedSampleIds,
      false
    );
    const newFailedIds = extractPublicIdsFromDataWFailedGenomeRecovery(data);
    // TODO TableItem[] appears identicle to Sample[] we should go through and refactor this once we have time to do so
    // since TableItem and Sample are identicle i think it's safe to do this cast here
    const newBadQCDataIds = extractPublicIdsWBadQCData(data as Sample[]);

    if (isHeaderIndeterminant || isHeaderChecked) {
      // remove samples in current data selection when selecting checkbox when indeterminate
      const newCheckedSamples = checkedSampleIds.filter(
        (el) => !newPublicIds.includes(el)
      );
      const newFailedSamples = failedSampleIds.filter(
        (el) => !newFailedIds.includes(el)
      );
      setCheckedSampleIds(newCheckedSamples);
      setFailedSampleIds(newFailedSamples);
      setBadQCSampleIds(newBadQCDataIds);
      setIsHeaderChecked(false);
      setHeaderIndeterminant(false);
    }
    if (!isHeaderChecked && !isHeaderIndeterminant) {
      // set isHeaderChecked to true, add all samples in current view
      setCheckedSampleIds(checkedSampleIds.concat(newPublicIds));
      setFailedSampleIds(failedSampleIds.concat(newFailedIds));
      setBadQCSampleIds(badQCSampleIds.concat(newBadQCDataIds));
      setIsHeaderChecked(true);
    }
  }

  function handleRowCheckboxClick(
    sampleId: string,
    failedGenomeRecovery: boolean,
    badQCData: boolean
  ) {
    if (checkedSampleIds.includes(sampleId)) {
      setCheckedSampleIds(checkedSampleIds.filter((id) => id !== sampleId));
      if (failedGenomeRecovery) {
        setFailedSampleIds(failedSampleIds.filter((id) => id !== sampleId));
      }
      if (badQCData) {
        setBadQCSampleIds(badQCSampleIds.filter((id) => id !== sampleId));
      }
    } else {
      setCheckedSampleIds([...checkedSampleIds, sampleId]);
      if (failedGenomeRecovery) {
        setFailedSampleIds([...failedSampleIds, sampleId]);
      }
      if (badQCData) {
        setBadQCSampleIds([...badQCSampleIds, sampleId]);
      }
    }
  }

  const indexingKey = headers[0].key;

  const handleSortClick = (newSortKey: string[]) => {
    // this column is not set up for sorting.
    if (newSortKey.length < 1) return;

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
      const onDeleteTreeModalOpen = isSampleTable
        ? noop
        : handleDeleteTreeModalOpen;

      const onEditTreeModalOpen = isSampleTable
        ? noop
        : handleEditTreeModalOpen;
      return (
        <Fragment key={`${item[indexingKey]}-${header.key}`}>
          {renderer({
            header,
            index,
            item,
            onDeleteTreeModalOpen,
            onEditTreeModalOpen,
            value,
          })}
        </Fragment>
      );
    });
  };

  const rowCheckbox = (item: Sample): React.ReactNode => {
    const checked: boolean = checkedSampleIds.includes(
      item?.publicId as string
    );
    const handleClick = function handleClick() {
      handleRowCheckboxClick(
        String(item.publicId),
        Boolean(item.CZBFailedGenomeRecovery),
        Boolean(item.qc_metrics && item.qc_metrics[0].qc_status === "bad")
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

  const isSampleTable = viewName === VIEWNAME.SAMPLES;

  const render = (tableData: TableItem[]) => {
    // TODO (mlila): this is the source of constant rerendering in the table. Because the rows are
    // TODO          rendered with a function instead of a react component, it generates a new node
    // TODO          every time the parent rerenders, instead of only updating, eg, when props change
    function renderRow(props: ListChildComponentProps) {
      const item = tableData[props.index];
      return (
        <TableRow style={props.style} data-test-id="table-row">
          {/* cast item as sample since they are identicle, related to earlier TODO around replacing all instances of TableItem with Sample */}
          {isSampleTable && rowCheckbox(item as Sample)}
          {item ? (
            sampleRow(item)
          ) : (
            <EmptyState numOfColumns={headers.length} />
          )}
        </TableRow>
      );
    }

    return (
      <Container>
        <HeaderRow
          handleHeaderCheckboxClick={handleHeaderCheckboxClick}
          handleSortClick={handleSortClick}
          headers={headers}
          isHeaderChecked={isHeaderChecked}
          isHeaderIndeterminant={isHeaderIndeterminant}
          isSortedAscending={state.ascending}
          isSampleTable={isSampleTable}
          sortColKey={state.sortKey}
        />
        <TableContent>
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
        </TableContent>
      </Container>
    );
  };

  if (data === undefined) {
    return render([]);
  }

  const sortedData = sortData(data, state.sortKey, state.ascending);
  return render(sortedData);
};
