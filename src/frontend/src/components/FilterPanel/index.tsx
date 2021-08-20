import { filter, forEach } from "lodash";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
import { StyledFilterPanel } from "./style";

type DateType = string | undefined;
enum TypeFilterType {
  Date = "date",
  Single = "single",
  Multiple = "multiple",
}
interface Props {
  setDataFilterFunc: Dispatch<
    SetStateAction<(data: TableItem[]) => TableItem[]>
  >;
}

interface FilterParamsType {
  end?: DateType;
  start?: DateType;
}
interface FilterType {
  key: string;
  params: FilterParamsType;
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
};

const applyFilter = (data: TableItem[], dataFilter: FilterType) => {
  if (!data) return [];

  const { key, params, type } = dataFilter;
  if (!key || !params || !type) return data;

  switch (type) {
    case TypeFilterType.Date:
      return filter(data, (d) => {
        const doesPassFilterCheckStart =
          !params.start || d[key] >= params.start;
        const doesPassFilterCheckEnd = !params.end || d[key] <= params.end;

        return doesPassFilterCheckStart && doesPassFilterCheckEnd;
      });
    case "single":
    case "multiple":
    default:
      return data;
  }
};

const FilterPanel: FC<Props> = ({ setDataFilterFunc }) => {
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
    const type = dataFilters[filterKey]?.type as TypeFilterType;
    const newFilters = {
      ...dataFilters,
      [filterKey]: {
        key: filterKey,
        params,
        type,
      },
    };

    setDataFilters(newFilters);
  };

  const updateCollectionDateFilter = (start: DateType, end: DateType) => {
    updateDataFilter("collectionDate", { end, start });
  };

  return (
    <StyledFilterPanel>
      <CollectionDateFilter
        updateCollectionDateFilter={updateCollectionDateFilter}
      />
    </StyledFilterPanel>
  );
};

export { FilterPanel };
