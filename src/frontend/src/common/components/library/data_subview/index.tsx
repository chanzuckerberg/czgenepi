import { escapeRegExp } from "lodash/fp";
import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import { CSVLink } from "react-csv";
import { Input } from "semantic-ui-react";
import { Chip } from "czifui";
import { DataTable } from "src/common/components";
import style from "./index.module.scss";
import { StyledDiv, StyledDownloadImage, DownloadWrapper, DownloadButtonWrapper } from "./style"

interface Props {
  data?: TableItem[];
  defaultSortKey: string[];
  headers: Header[];
  subheaders: Record<string, SubHeader[]>;
  isLoading: boolean;
  renderer?: CustomRenderer;
  headerRenderer?: CustomRenderer;
  viewName: string;
}

interface InputOnChangeData {
  [key: string]: string;
  value: string;
}

interface SearchState {
  searching?: boolean;
  results?: TableItem[];
}

function recursiveTest(
  item: Record<string | number, JSONPrimitive | Record<string, JSONPrimitive>>,
  query: RegExp
): boolean {
  return Object.values(item).some((value) => {
    if (typeof value === "object" && value !== null) {
      return recursiveTest(value, query);
    }
    return query.test(`${value}`);
  });
}

function searchReducer(state: SearchState, action: SearchState): SearchState {
  return { ...state, ...action };
}

function tsvDataMap(
  tableData: TableItem[],
  headers: Header[],
  subheaders: Record<string, SubHeader[]>
): [string[], string[][]] {
  const headersDownload = [...headers];
  headersDownload[7] = {
    key: "CZBFailedGenomeRecovery",
    sortKey: ["CZBFailedGenomeRecovery"],
    text: "Genome Recovery",
  };
  const tsvData = tableData.map((entry) => {
    return headersDownload.flatMap((header) => {
      if (
        typeof entry[header.key] === "object" &&
        Object.prototype.hasOwnProperty.call(subheaders, header.key)
      ) {
        const subEntry = entry[header.key] as Record<string, JSONPrimitive>;
        return subheaders[header.key].map((subheader) =>
          String(subEntry[subheader.key])
        );
      }
      if (header.key == "CZBFailedGenomeRecovery") {
        if (entry[header.key]) {
          return "Failed";
        } else {
          return "Success";
        }
      } else {
        return String(entry[header.key]);
      }
    });
  });
  const tsvHeaders = headersDownload.flatMap((header) => {
    if (Object.prototype.hasOwnProperty.call(subheaders, header.key)) {
      return subheaders[header.key].map((subheader) => subheader.text);
    }
    return header.text;
  });

  return [tsvHeaders, tsvData];
}

const DataSubview: FunctionComponent<Props> = ({
  data,
  defaultSortKey,
  headers,
  subheaders,
  isLoading,
  renderer,
  headerRenderer,
  viewName,
}: Props) => {
  // we are modifying state using hooks, so we need a reducer
  const [state, dispatch] = useReducer(searchReducer, {
    results: data,
    searching: false,
  });

  const [checkedSamples, setCheckedSamples] = useState<any[]>([]);
  const [isHeaderChecked, setIsHeaderChecked] = useState<boolean>(false);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);
  const [isHeaderIndeterminant, setHeaderIndeterminant] =
    useState<boolean>(false);

  useEffect(() => {
    if (isHeaderChecked) {
      const allPrivateIds: any[] = [];
      for (const key in data) {
        allPrivateIds.push(data[key as any].privateId);
      }
      setCheckedSamples(allPrivateIds);
    } else {
      setCheckedSamples([]);
    }
  }, [isHeaderChecked]);

  useEffect(() => {
    if (viewName === "Samples") {
      setShowCheckboxes(true);
    }
  }, [viewName]);

  useEffect(() => {
    // determine if mixed state (user has custom selected samples)
    if (data) {
      const sizeData: number = Object.keys(data).length;
      if (checkedSamples.length === 0 || checkedSamples.length === sizeData) {
        setHeaderIndeterminant(false);
      } else {
        setHeaderIndeterminant(true);
      }
    }
  }, [checkedSamples]);

  function handleHeaderCheckboxClick() {
    if (isHeaderIndeterminant) {
      // clear all samples when selecting checkbox when indeterminate
      setCheckedSamples([]);
      setIsHeaderChecked(false);
    } else {
      setIsHeaderChecked((prevState: boolean) => !prevState);
    }
  }

  function handleRowCheckboxClick(sampleId: string) {
    if (checkedSamples.includes(sampleId)) {
      setCheckedSamples(checkedSamples.filter((id) => id !== sampleId));
    } else {
      setCheckedSamples([...checkedSamples, sampleId]);
    }
  }

  // search functions
  const searcher = (
    _event: React.ChangeEvent<HTMLInputElement>,
    fieldInput: InputOnChangeData
  ) => {
    const query = fieldInput.value;
    if (data === undefined) {
      return;
    } else if (query.length === 0) {
      dispatch({ results: data });
      return;
    }

    dispatch({ searching: true });

    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredData = data.filter((item) => recursiveTest(item, regex));
    dispatch({ results: filteredData, searching: false });
  };

  const render = (tableData?: TableItem[]) => {
    let downloadButton: JSX.Element | null = null;
    if (viewName === "Samples" && tableData !== undefined) {
      const [tsvHeaders, tsvData] = tsvDataMap(tableData, headers, subheaders);
      const separator = "\t";
      downloadButton = (
        <DownloadWrapper>
        <CSVLink
          data={tsvData}
          headers={tsvHeaders}
          filename="samples_overview.tsv"
          separator={separator}
          data-test-id="download-tsv-link"
        >
          <Chip size="medium" label={checkedSamples.length} status="info" /> 
          <StyledDiv>Selected </StyledDiv>
          <StyledDownloadImage />
        </CSVLink>
        </DownloadWrapper>
      );
    }

    return (
      <div className={style.samplesRoot}>
        <div className={style.searchBar}>
          <div className={style.searchInput}>
            <Input
              icon="search"
              placeholder="Search"
              loading={state.searching}
              onChange={searcher}
              data-test-id="search"
            />
          </div>
          <DownloadButtonWrapper>{downloadButton}</DownloadButtonWrapper>
        </div>
        <div className={style.samplesTable}>
          <DataTable
            isLoading={isLoading}
            checkedSamples={checkedSamples}
            showCheckboxes={showCheckboxes}
            handleRowCheckboxClick={handleRowCheckboxClick}
            isHeaderChecked={isHeaderChecked}
            handleHeaderCheckboxClick={handleHeaderCheckboxClick}
            isHeaderIndeterminant={isHeaderIndeterminant}
            data={tableData}
            defaultSortKey={defaultSortKey}
            headers={headers}
            headerRenderer={headerRenderer}
            renderer={renderer}
          />
        </div>
      </div>
    );
  };

  if (!state.results) {
    let tableData;

    if (data) {
      dispatch({ results: data });
      tableData = data;
    }

    return render(tableData);
  }

  return render(state.results);
};

export { DataSubview };
