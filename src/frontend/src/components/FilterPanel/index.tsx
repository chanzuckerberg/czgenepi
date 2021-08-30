import { filter, forEach, isEqual } from "lodash";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
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
  lineages: DefaultMenuSelectOption[];
  setDataFilterFunc: Dispatch<
    SetStateAction<(data: TableItem[]) => TableItem[]>
  >;
}

interface FilterParamsType {
  end?: DateType;
  selected?: string[];
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
  collectionDate: {
    key: "collectionDate",
    params: {
      end: undefined,
      start: undefined,
    },
    type: TypeFilterType.Date,
  },
  lineage: {
    key: "lineage",
    params: {
      selected: [],
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
    type: TypeFilterType.Date,
  },
};

const applyFilter = (data: TableItem[], dataFilter: FilterType) => {
  if (!data) return [];

  const { key, params, transform, type } = dataFilter;
  if (!key || !params || !type) return data;
  const { end, start, selected = [] } = params;

  switch (type) {
    case TypeFilterType.Date:
      return filter(data, (d) => {
        const doesPassFilterCheckStart = !start || d[key] >= start;
        const doesPassFilterCheckEnd = !end || d[key] <= end;

        return doesPassFilterCheckStart && doesPassFilterCheckEnd;
      });
    case TypeFilterType.Multiple:
      if (selected.length === 0) return data;

      return filter(data, (d) => {
        const value = transform ? transform(d) : d;
        return selected.includes(value);
      });
    case TypeFilterType.Single:
    default:
      return data;
  }
};

const FilterPanel: FC<Props> = ({ lineages, setDataFilterFunc }) => {
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

  const updateLineageFilter = (selected: string[]) => {
    const prevSelected = dataFilters.lineage?.params.selected;

    // * (mlila): need to do a comparison here, or else the component gets into
    // * an infinite state loop (because arrays are compared by identity rather
    // * than content, by default)
    if (!isEqual(prevSelected, selected)) {
      updateDataFilter("lineage", { selected });
    }
  };

  return (
    <StyledFilterPanel>
      <CollectionDateFilter
        updateCollectionDateFilter={updateCollectionDateFilter}
      />
      <UploadDateFilter updateUploadDateFilter={updateUploadDateFilter} />
      <LineageFilter
        options={lineages}
        updateLineageFilter={updateLineageFilter}
      />
    </StyledFilterPanel>
  );
};

export { FilterPanel };
