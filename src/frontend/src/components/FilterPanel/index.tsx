import { filter, forEach } from "lodash";
import React, { FC, useEffect, useState } from "react";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
import { StyledFilterPanel } from "./style";

// * (mlila): `key` should be the name of the column you are filtering on
const DATA_FILTER_INIT = {
  collectionDate: {
    key: "collectionDate",
    params: {
      end: undefined,
      start: undefined,
    },
    type: "date",
  },
};

const applyFilter = (data, dataFilter) => {
  if (!data) return;

  const { key, params, type } = dataFilter;
  if (!key || !params || !type) return data;

  switch (type) {
    case "date":
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

const FilterPanel: FC = ({ setDataFilterFunc }: Props) => {
  //TODOO better type here
  const [dataFilters, setDataFilters] = useState<any[]>(DATA_FILTER_INIT);

  useEffect(() => {
    const wrappedFilterFunc = () => {
      const filterFunc = (filters) => {
        return (data) => {
          let filteredData = { ...data };
          forEach(filters, (filter) => {
            filteredData = applyFilter(filteredData, filter);
          });
          return filteredData;
        };
      };
      return filterFunc(dataFilters);
    };

    setDataFilterFunc(wrappedFilterFunc);
  }, [dataFilters, setDataFilterFunc]);

  const updateDataFilter = (filterKey, params) => {
    const type = dataFilters[filterKey]?.type;
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

  const updateCollectionDateFilter = (start, end) => {
    updateDataFilter("collectionDate", { end, start });
  };

  return (
    <StyledFilterPanel>
      I am a filter panel
      <CollectionDateFilter
        updateCollectionDateFilter={updateCollectionDateFilter}
      />
    </StyledFilterPanel>
  );
};

export { FilterPanel };
