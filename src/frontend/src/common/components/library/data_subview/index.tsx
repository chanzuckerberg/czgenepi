import { Button } from "czifui";
import { escapeRegExp } from "lodash/fp";
import React, { FunctionComponent, useReducer } from "react";
import { CSVLink } from "react-csv";
import { Input } from "semantic-ui-react";
import { DataTable } from "src/common/components";
import style from "./index.module.scss";

interface Props {
  data?: TableItem[];
  headers: Header[];
  subheaders: Record<string, Header[]>;
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

function searchReducer(state: SearchState, action: SearchState): SearchState {
  return { ...state, ...action };
}

function tsvDataMap(
  tableData: TableItem[],
  headers: Header[],
  subheaders: Record<string, Header[]>
): [string[], string[][]] {
  const tsvData = tableData.map((entry) => {
    return headers.flatMap((header) => {
      if (
        typeof entry[header.key] === "object" &&
        Object.prototype.hasOwnProperty.call(subheaders, header.key)
      ) {
        const subEntry = entry[header.key] as Record<string, JSONPrimitive>;
        return subheaders[header.key].map((subheader) =>
          String(subEntry[subheader.key])
        );
      }
      return String(entry[header.key]);
    });
  });
  const tsvHeaders = headers.flatMap((header) => {
    if (Object.prototype.hasOwnProperty.call(subheaders, header.key)) {
      return subheaders[header.key].map((subheader) => subheader.text);
    }
    return header.text;
  });

  return [tsvHeaders, tsvData];
}

const DataSubview: FunctionComponent<Props> = ({
  data,
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
    const filteredData = data.filter((item) =>
      Object.values(item).some((value) => regex.test(`${value}`))
    );

    dispatch({ results: filteredData, searching: false });
  };

  const render = (tableData: TableItem[]) => {
    const [tsvHeaders, tsvData] = tsvDataMap(tableData, headers, subheaders);
    const separator = "\t";

    let downloadButton: JSX.Element | null = null;
    if (viewName === "Samples") {
      downloadButton = (
        <CSVLink
          data={tsvData}
          headers={tsvHeaders}
          filename="samples_overview.tsv"
          separator={separator}
        >
          <Button
            variant="contained"
            color="primary"
            isRounded
            className={style.tsvDownloadButton}
          >
            Download (.tsv)
          </Button>
        </CSVLink>
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
            />
          </div>
          <div className={style.searchBarTableDownload}>{downloadButton}</div>
        </div>
        <div className={style.samplesTable}>
          <DataTable
            isLoading={isLoading}
            data={tableData}
            headers={headers}
            headerRenderer={headerRenderer}
            renderer={renderer}
          />
        </div>
      </div>
    );
  };

  if (state.results === undefined) {
    let tableData: TableItem[] = [];
    if (data !== undefined) {
      dispatch({ results: data });
      tableData = data;
    }
    return render(tableData);
  }

  return render(state.results);
};

export { DataSubview };
