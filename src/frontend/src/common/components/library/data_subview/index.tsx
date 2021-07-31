import { Button, Chip, Tooltip } from "czifui";
import { escapeRegExp } from "lodash/fp";
import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Input } from "semantic-ui-react";
import { DataTable } from "src/common/components";
import DownloadModal from "./components/DownloadModal";
import style from "./index.module.scss";
import {
  BoldText,
  DismissButton,
  Divider,
  DownloadButtonWrapper,
  DownloadWrapper,
  StyledAlert,
  StyledDiv,
  StyledDownloadDisabledImage,
  StyledDownloadImage,
  StyledLink,
} from "./style";

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
  checkedSamples: string[],
  tableData: TableItem[] | undefined,
  headers: Header[],
  subheaders: Record<string, SubHeader[]>
): [string[], string[][]] | undefined {
  const headersDownload = [...headers];
  headersDownload[7] = {
    key: "CZBFailedGenomeRecovery",
    sortKey: ["CZBFailedGenomeRecovery"],
    text: "Genome Recovery",
  };
  if (tableData !== undefined) {
    const filteredTableData = [...tableData];
    const filteredTableDataForReals = filteredTableData.filter((entry) =>
      checkedSamples.includes(entry["publicId"].toString())
    );
    const tsvData = filteredTableDataForReals.map((entry) => {
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
  const [open, setOpen] = useState(false);
  const [isDownloadDisabled, setDownloadDisabled] = useState<boolean>(true);
  const [failedSamples, setFailedSamples] = useState<string[]>([]);
  const [downloadFailed, setDownloadFailed] = useState<boolean>(false);

  const handleDownloadClickOpen = () => {
    setOpen(true);
  };

  const handleDownloadClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    // add all samples if header checkbox is selected
    if (isHeaderChecked) {
      const allPublicIds: any[] = [];
      for (const key in data) {
        allPublicIds.push(data[key as any].publicId);
      }
      setCheckedSamples(allPublicIds);
    } else {
      setFailedSamples([]);
      setCheckedSamples([]);
    }
  }, [isHeaderChecked]);

  useEffect(() => {
    // Only show checkboxes on the sample datatable
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

  useEffect(() => {
    // disable sample download if no samples are selected
    if (checkedSamples.length === 0) {
      setDownloadDisabled(true);
    } else {
      setDownloadDisabled(false);
    }
  });

  useEffect(() => {
    // if there is an error then close the modal.
    if (downloadFailed) {
      setOpen(false);
    }
  });

  function handleHeaderCheckboxClick() {
    if (isHeaderIndeterminant) {
      // clear all samples when selecting checkbox when indeterminate
      setCheckedSamples([]);
      setFailedSamples([]);
      setIsHeaderChecked(false);
    } else {
      setIsHeaderChecked((prevState: boolean) => !prevState);
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

  function handleDismissErrorClick() {
    setDownloadFailed(false);
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
      downloadButton = (
        <DownloadWrapper>
          <Tooltip title="Download some samples" arrow={true}>
            <span>
              <Button
                onClick={handleDownloadClickOpen}
                disabled={isDownloadDisabled}
              >
                <Chip
                  size="medium"
                  label={checkedSamples.length}
                  status="info"
                />
                <StyledDiv>Selected </StyledDiv>
                <Divider />
                {isDownloadDisabled ? (
                  <StyledDownloadDisabledImage />
                ) : (
                  <StyledDownloadImage />
                )}
              </Button>
            </span>
          </Tooltip>
        </DownloadWrapper>
      );
    }

    return (
      <>
        {tableData !== undefined && viewName === "Samples" && (
          <DownloadModal
            sampleIds={checkedSamples}
            failedSamples={failedSamples}
            setDownloadFailed={setDownloadFailed}
            tsvData={tsvDataMap(checkedSamples, tableData, headers, subheaders)}
            open={open}
            onClose={handleDownloadClose}
          />
        )}
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
            <DownloadButtonWrapper>
              {downloadFailed ? (
                <StyledAlert className="elevated" severity="error">
                  <div>
                    <BoldText>
                      Something went wrong and we were unable to complete one or
                      more of your downloads
                    </BoldText>
                    Please try again later or{" "}
                    <StyledLink
                      href="mailto:aspenprivacy@chanzuckerberg.com"
                      target="_blank"
                      rel="noopener"
                    >
                      contact us
                    </StyledLink>{" "}
                    for help.
                  </div>
                  <DismissButton onClick={handleDismissErrorClick}>
                    DISMISS
                  </DismissButton>
                </StyledAlert>
              ) : (
                downloadButton
              )}
            </DownloadButtonWrapper>
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
      </>
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
