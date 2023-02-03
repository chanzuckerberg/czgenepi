import { filter, forEach, isEqual } from "lodash";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  AnalyticsSamplesFilter,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { getQCStatusFromSample } from "src/views/Upload/components/Samples/utils";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
import { LineageFilter } from "./components/LineageFilter";
import { QCStatusFilter } from "./components/QCStatusFilter";
import { UploadDateFilter } from "./components/UploadDateFilter";
import { StyledFilterPanel } from "./style";

enum TypeFilterType {
  Date = "date",
  Single = "single",
  Multiple = "multiple",
}
export interface DefaultMenuSelectOption {
  name: string;
}

interface Props {
  isOpen: boolean;
  lineages: DefaultMenuSelectOption[];
  qcStatuses: DefaultMenuSelectOption[];
  setActiveFilterCount: (count: number) => void;
  setDataFilterFunc: Dispatch<SetStateAction<(data: Sample[]) => Sample[]>>;
}

interface FilterParamsType {
  end?: Date;
  multiSelected?: string[];
  selected?: string | undefined;
  start?: Date;
}
interface FilterType {
  key: string;
  params: FilterParamsType;
  transform?: (d: any) => any;
  type: TypeFilterType;
}

interface FiltersType {
  [filterKey: string]: FilterType;
}

// * (mlila): `key` should be the name of the column you are filtering on
const DATA_FILTER_INIT = {
  qcMetrics: {
    key: "qcMetrics",
    params: {
      multiSelected: [],
    },
    transform: getQCStatusFromSample,
    type: TypeFilterType.Multiple,
  },
  collectionDate: {
    key: "collectionDate",
    params: {
      end: undefined,
      start: undefined,
    },
    transform: (d: Sample) => d.collectionDate,
    type: TypeFilterType.Date,
  },
  lineage: {
    key: "lineage",
    params: {
      multiSelected: [],
    },
    transform: (d: Sample) => d.lineages[0]?.lineage,
    type: TypeFilterType.Multiple,
  },
  uploadDate: {
    key: "uploadDate",
    params: {
      end: undefined,
      start: undefined,
    },
    transform: (d: Sample) => d.uploadDate,
    type: TypeFilterType.Date,
  },
};

const applyFilter = (data: Sample[], dataFilter: FilterType) => {
  if (!data) return [];

  const { key, params, transform, type } = dataFilter;
  if (!key || !params || !type) return data;
  const { end, start, multiSelected = [], selected } = params;

  switch (type) {
    case TypeFilterType.Date:
      if (!start && !end) return data;

      return filter(data, (d) => {
        const value = transform ? transform(d) : d;
        const dateValue = new Date(value);

        const doesPassFilterCheckStart = !start || dateValue >= start;
        const doesPassFilterCheckEnd = !end || dateValue <= end;

        return doesPassFilterCheckStart && doesPassFilterCheckEnd;
      });
    case TypeFilterType.Multiple:
      if (multiSelected.length === 0) return data;

      return filter(data, (d) => {
        const value = transform ? transform(d) : d;
        return multiSelected.includes(value);
      });
    case TypeFilterType.Single:
      if (!selected) return data;

      return filter(data, (d) => {
        const value = transform ? transform(d) : d;
        return selected === value;
      });
    default:
      return data;
  }
};

const FilterPanel: FC<Props> = ({
  isOpen,
  lineages,
  qcStatuses,
  setActiveFilterCount,
  setDataFilterFunc,
}) => {
  const pathogen = useSelector(selectCurrentPathogen);
  const [dataFilters, setDataFilters] = useState<FiltersType>(DATA_FILTER_INIT);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  useEffect(() => {
    const uploadDate = activeFilters.find((e) => e.key === "uploadDate");
    const collectionDate = activeFilters.find(
      (e) => e.key === "collectionDate"
    );
    const qcStatus = activeFilters.find((e) => e.key === "qcMetrics");
    const lineage = activeFilters.find((e) => e.key === "lineage");
    const qcStatuses = qcStatus?.params.multiSelected || [];
    const lineages = lineage?.params.multiSelected || [];

    const anyFiltersActive: boolean[] = [
      !!uploadDate,
      !!collectionDate,
      !!qcStatus,
      !!lineage,
    ];
    // only trigger analytics event if any filters are active
    if (anyFiltersActive.includes(true)) {
      analyticsTrackEvent<AnalyticsSamplesFilter>(EVENT_TYPES.SAMPLES_FILTER, {
        filtering_by_upload_date: !!uploadDate,
        filtering_by_collection_date: !!collectionDate,
        filtering_by_qc_status: !!qcStatus,
        filtering_by_lineage: !!lineage,
        qc_statuses: JSON.stringify(qcStatuses),
        lineages: JSON.stringify(lineages),
        // format dates to match YYYY-MM-DD
        upload_date_start:
          uploadDate?.params.start?.toLocaleDateString("en-CA"),
        upload_date_end: uploadDate?.params.end?.toLocaleDateString("en-CA"),
        collection_date_start:
          collectionDate?.params.start?.toLocaleDateString("en-CA"),
        collection_date_end:
          collectionDate?.params.end?.toLocaleDateString("en-CA"),
        pathogen: pathogen,
      });
    }
  }, [activeFilters]);

  useEffect(() => {
    const wrappedFilterFunc = () => {
      const filterFunc = (filters: FiltersType) => {
        return (data: Sample[]) => {
          let filteredData = [...data];
          forEach(filters, (filter: FilterType) => {
            filteredData = applyFilter(filteredData, filter);
          });
          return filteredData;
        };
      };
      return filterFunc(dataFilters);
    };

    setDataFilterFunc(wrappedFilterFunc);
  }, [dataFilters, setDataFilterFunc]);

  useEffect(() => {
    const activeFilters = filter(dataFilters, (f) => {
      const { params, type } = f;
      let hasDefinedParam = false;

      type keyType = keyof FilterParamsType;
      const keys = Object.keys(params) as keyType[];

      forEach(keys, (k) => {
        const param = params[k];
        const isActive =
          param && type === TypeFilterType.Multiple
            ? (param as string[]).length > 0
            : param;

        if (isActive) {
          hasDefinedParam = true;
        }
      });

      return hasDefinedParam;
    });
    setActiveFilterCount(activeFilters.length);
    setActiveFilters(activeFilters);
  }, [dataFilters, setActiveFilterCount]);

  const updateDataFilter = (filterKey: string, params: FilterParamsType) => {
    const { transform, type } = dataFilters[filterKey];
    const newFilters = {
      ...dataFilters,
      [filterKey]: {
        key: filterKey,
        params,
        transform,
        type,
      },
    };

    setDataFilters(newFilters);
  };

  const updateCollectionDateFilter: UpdateDateFilterType = (start, end) => {
    updateDataFilter("collectionDate", { end, start });
  };

  const updateUploadDateFilter: UpdateDateFilterType = (start, end) => {
    updateDataFilter("uploadDate", { end, start });
  };

  const updateLineageFilter = (multiSelected: string[]) => {
    const prevSelected = dataFilters.lineage?.params.multiSelected;

    // * (mlila): need to do a comparison here, or else the component gets into
    // * an infinite state loop (because arrays are compared by identity rather
    // * than content, by default)
    if (!isEqual(prevSelected, multiSelected)) {
      updateDataFilter("lineage", { multiSelected });
    }
  };

  const updateQCStatusFilter = (multiSelected: string[]) => {
    const prevSelected = dataFilters.qcMetrics?.params.multiSelected;

    // * (mlila): need to do a comparison here, or else the component gets into
    // * an infinite state loop (because arrays are compared by identity rather
    // * than content, by default)
    if (!isEqual(prevSelected, multiSelected)) {
      updateDataFilter("qcMetrics", { multiSelected });
    }
  };

  return (
    <StyledFilterPanel isOpen={isOpen}>
      <UploadDateFilter
        updateUploadDateFilter={updateUploadDateFilter}
        data-test-id="sample-filter-upload-date"
      />
      <CollectionDateFilter
        updateCollectionDateFilter={updateCollectionDateFilter}
        data-test-id="sample-filter-collection-date"
      />
      <LineageFilter
        options={lineages}
        updateLineageFilter={updateLineageFilter}
        data-test-id="sample-filter-lineage"
      />
      <QCStatusFilter
        options={qcStatuses}
        updateQCStatusFilter={updateQCStatusFilter}
        data-test-id="sample-filter-qc-status"
      />
    </StyledFilterPanel>
  );
};

export { FilterPanel };
