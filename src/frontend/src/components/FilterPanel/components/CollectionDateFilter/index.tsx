import React, { FC } from "react";
import { DateFilter, FormattedDateType } from "../DateFilter";

interface Props {
  updateCollectionDateFilter: (
    start: FormattedDateType,
    end: FormattedDateType
  ) => void;
}

const CollectionDateFilter: FC<Props> = ({ updateCollectionDateFilter }) => {
  return (
    <DateFilter
      filterKeyEnd="collectionDateEnd"
      filterKeyStart="collectionDateStart"
      inputLabel="Collection Date"
      updateDateFilter={updateCollectionDateFilter}
    />
  );
};

export { CollectionDateFilter };
