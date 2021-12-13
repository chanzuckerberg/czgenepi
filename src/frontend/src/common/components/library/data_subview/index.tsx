import { compact, escapeRegExp, filter } from "lodash";
import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Input } from "semantic-ui-react";
import { DataTable } from "src/common/components";
import { VIEWNAME } from "src/common/constants/types";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { CreateNSTreeModal } from "./components/CreateNSTreeModal";
import { DeleteSamplesConfirmationModal } from "./components/DeleteSamplesConfirmationModal";
import DownloadModal from "./components/DownloadModal";
import { IconButton } from "./components/IconButton";
import { MoreActionsMenu } from "./components/MoreActionMenu";
import { TreeCreateHelpLink } from "./components/TreeCreateHelpLink";
import { TreeSelectionMenu } from "./components/TreeSelectionMenu";
import { UsherTreeFlow } from "./components/UsherTreeFlow";
import style from "./index.module.scss";
import {
  Divider,
  DownloadWrapper,
  StyledChip,
  StyledDiv,
  StyledDownloadDisabledImage,
  StyledDownloadImage,
  StyledFlexChildDiv,
  TooltipDescriptionText,
  TooltipHeaderText,
} from "./style";

interface Props {
  data?: BioinformaticsMap;
  defaultSortKey: string[];
  headers: Header[];
  subheaders: Record<string, SubHeader[]>;
  isLoading: boolean;
  renderer?: CustomRenderer;
  viewName: VIEWNAME;
  dataFilterFunc?: (data: TableItem[]) => TableItem[];
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
  checkedSampleIds: string[],
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
  if (tableData) {
    const filteredTableData = tableData.filter((entry) =>
      checkedSampleIds.includes(String(entry["publicId"]))
    );
    const tsvData = filteredTableData.map((entry) => {
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
  viewName,
  dataFilterFunc,
}: Props) => {
  // we are modifying state using hooks, so we need a reducer
  const [state, dispatch] = useReducer(searchReducer, {
    results: Object.values(data ?? {}),
    searching: false,
  });

  const [checkedSampleIds, setCheckedSampleIds] = useState<string[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [failedSampleIds, setFailedSampleIds] = useState<string[]>([]);
  const [isNSCreateTreeModalOpen, setIsNSCreateTreeModalOpen] =
    useState<boolean>(false);
  const [shouldStartUsherFlow, setShouldStartUsherFlow] =
    useState<boolean>(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleDownloadClickOpen = () => {
    setDownloadModalOpen(true);
  };

  const handleCreateNSTreeOpen = () => {
    setIsNSCreateTreeModalOpen(true);
  };

  const handleCreateTreeClose = () => {
    setIsNSCreateTreeModalOpen(false);
  };

  const handleDownloadClose = () => {
    setDownloadModalOpen(false);
  };

  useEffect(() => {
    if (shouldStartUsherFlow) setShouldStartUsherFlow(false);
  }, [shouldStartUsherFlow]);

  useEffect(() => {
    searcher(searchQuery);
  }, [data]);

  useEffect(() => {
    // Only show checkboxes on the sample datatable
    if (viewName === VIEWNAME.SAMPLES) {
      setShowCheckboxes(true);
    }
  }, [viewName]);

  const handleDeleteSampleModalClose = () => {
    setDeleteConfirmationOpen(false);
    setCheckedSampleIds([]);
  };

  const onChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    fieldInput: InputOnChangeData
  ) => {
    const query = fieldInput.value;
    searcher(query);
    setSearchQuery(query);
  };

  // search functions
  const searcher = (query: string): void => {
    if (data === undefined) {
      return;
    } else if (query.length === 0) {
      dispatch({ results: Object.values(data) });
      return;
    }

    dispatch({ searching: true });

    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredData = filter(data, (item) => recursiveTest(item, regex));
    dispatch({ results: filteredData, searching: false });
  };

  const DOWNLOAD_TOOLTIP_TEXT_DISABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
      <TooltipDescriptionText>Select at least 1 sample</TooltipDescriptionText>
    </div>
  );

  const DOWNLOAD_TOOLTIP_TEXT_ENABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
    </div>
  );

  const numCheckedSamples = checkedSampleIds?.length;
  const hasCheckedSamples = numCheckedSamples > 0;
  const hasTooManySamples = numCheckedSamples > 2000;

  const render = (tableData?: TableItem[]) => {
    let sampleActions: JSX.Element | null = null;
    if (viewName === VIEWNAME.SAMPLES && tableData !== undefined) {
      sampleActions = (
        <DownloadWrapper>
          <StyledChip isRounded label={checkedSampleIds.length} status="info" />
          <StyledDiv>Selected </StyledDiv>
          <Divider />
          <TreeSelectionMenu
            handleCreateNSTreeOpen={handleCreateNSTreeOpen}
            handleCreateUsherTreeOpen={() => setShouldStartUsherFlow(true)}
            isMenuDisabled={hasTooManySamples}
            isUsherDisabled={!hasCheckedSamples}
          />
          <IconButton
            onClick={handleDownloadClickOpen}
            disabled={!hasCheckedSamples}
            svgDisabled={<StyledDownloadDisabledImage />}
            svgEnabled={<StyledDownloadImage />}
            tooltipTextDisabled={DOWNLOAD_TOOLTIP_TEXT_DISABLED}
            tooltipTextEnabled={DOWNLOAD_TOOLTIP_TEXT_ENABLED}
          />
          {usesFeatureFlag(FEATURE_FLAGS.crudV0) && (
            <MoreActionsMenu
              disabled={!hasCheckedSamples}
              onDeleteSelected={() => setDeleteConfirmationOpen(true)}
            />
          )}
        </DownloadWrapper>
      );
    }

    // convert array of sample ids into a list of sample objects
    const checkedSamples = compact(
      checkedSampleIds.map((id) => data?.[id]) as Sample[]
    );

    return (
      <>
        {tableData !== undefined && viewName === VIEWNAME.SAMPLES && (
          <>
            <DownloadModal
              checkedSampleIds={checkedSampleIds}
              failedSampleIds={failedSampleIds}
              tsvData={tsvDataMap(
                checkedSampleIds,
                tableData,
                headers,
                subheaders
              )}
              open={isDownloadModalOpen}
              onClose={handleDownloadClose}
            />
            <CreateNSTreeModal
              checkedSampleIds={checkedSampleIds}
              failedSampleIds={failedSampleIds}
              open={isNSCreateTreeModalOpen}
              onClose={handleCreateTreeClose}
            />
            <UsherTreeFlow
              checkedSampleIds={checkedSampleIds}
              failedSampleIds={failedSampleIds}
              shouldStartUsherFlow={shouldStartUsherFlow}
            />
            <DeleteSamplesConfirmationModal
              checkedSamples={checkedSamples}
              onClose={handleDeleteSampleModalClose}
              open={isDeleteConfirmationOpen}
            />
          </>
        )}
        <StyledFlexChildDiv className={style.samplesRoot}>
          <div className={style.searchBar}>
            <div className={style.searchInput}>
              <Input
                icon="search"
                placeholder="Search"
                loading={state.searching}
                onChange={onChange}
                data-test-id="search"
              />
            </div>
            <div>
              {viewName === VIEWNAME.TREES && <TreeCreateHelpLink />}
              {sampleActions}
            </div>
          </div>
          <div className={style.samplesTable}>
            <DataTable
              isLoading={isLoading}
              checkedSampleIds={checkedSampleIds}
              setCheckedSampleIds={setCheckedSampleIds}
              failedSampleIds={failedSampleIds}
              setFailedSampleIds={setFailedSampleIds}
              showCheckboxes={showCheckboxes}
              data={
                dataFilterFunc && tableData
                  ? dataFilterFunc(tableData)
                  : tableData
              }
              defaultSortKey={defaultSortKey}
              headers={headers}
              renderer={renderer}
            />
          </div>
        </StyledFlexChildDiv>
      </>
    );
  };

  if (!state.results) {
    let tableData;

    if (data) {
      const values = Object.values(data);
      dispatch({ results: values });
      tableData = values;
    }

    return render(tableData);
  }

  return render(state.results);
};

export { DataSubview };
