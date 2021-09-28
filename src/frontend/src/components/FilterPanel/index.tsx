import { filter, forEach, isEqual } from "lodash";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
import { GenomeRecoveryFilter } from "./components/GenomeRecoveryFilter";
import { LineageFilter } from "./components/LineageFilter";
import { UploadDateFilter } from "./components/UploadDateFilter";
import { StyledFilterPanel } from "./style";

type DateType = string | undefined;
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
  setActiveFilterCount: (count: number) => void;
  setDataFilterFunc: Dispatch<
    SetStateAction<(data: TableItem[]) => TableItem[]>
  >;
}

interface FilterParamsType {
  end?: DateType;
  multiSelected?: string[];
  selected?: string | undefined;
  start?: DateType;
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
  CZBFailedGenomeRecovery: {
    key: "CZBFailedGenomeRecovery",
    params: {
      selected: undefined,
    },
    transform: (d: Sample) =>
      d.CZBFailedGenomeRecovery ? "Failed" : "Complete",
    type: TypeFilterType.Single,
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
    transform: (d: Sample) => d.lineage?.lineage,
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

const applyFilter = (data: TableItem[], dataFilter: FilterType) => {
  if (!data) return [];

  const { key, params, transform, type } = dataFilter;
  if (!key || !params || !type) return data;
  const { end, start, multiSelected = [], selected } = params;

  switch (type) {
    case TypeFilterType.Date:
      return filter(data, (d) => {
        const value = transform ? transform(d) : d;
        const doesPassFilterCheckStart = !start || value >= start;
        const doesPassFilterCheckEnd = !end || value <= end;

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
  setActiveFilterCount,
  setDataFilterFunc,
}) => {
  const [dataFilters, setDataFilters] = useState<FiltersType>(DATA_FILTER_INIT);

  useEffect(() => {
    const wrappedFilterFunc = () => {
      const filterFunc = (filters: FiltersType) => {
        return (data: TableItem[]) => {
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
          param && type === TypeFilterType.Multiple ? param.length > 0 : param;

        if (isActive) {
          hasDefinedParam = true;
        }
      });

      return hasDefinedParam;
    });

    setActiveFilterCount(activeFilters.length);
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

  const updateCollectionDateFilter = (start: DateType, end: DateType) => {
    updateDataFilter("collectionDate", { end, start });
  };

  const updateUploadDateFilter = (start: DateType, end: DateType) => {
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

  const updateGenomeRecoveryFilter = (selected?: string) => {
    const prevSelected = dataFilters.CZBFailedGenomeRecovery?.params.selected;

    if (!isEqual(prevSelected, selected)) {
      updateDataFilter("CZBFailedGenomeRecovery", { selected });
    }
  };

  return (
    <StyledFilterPanel isOpen={isOpen}>
      <CollectionDateFilter
        updateCollectionDateFilter={updateCollectionDateFilter}
      />
      <UploadDateFilter updateUploadDateFilter={updateUploadDateFilter} />
      <LineageFilter
        options={lineages}
        updateLineageFilter={updateLineageFilter}
      />
      <GenomeRecoveryFilter
        updateGenomeRecoveryFilter={updateGenomeRecoveryFilter}
      />
    </StyledFilterPanel>
  );
};

export { FilterPanel };
