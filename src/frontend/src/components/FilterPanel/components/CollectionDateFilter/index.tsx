import React, { FC } from "react";
import { FormattedDateType } from "src/components/DateField";
import { DateFilter } from "../DateFilter";

interface Props {
  updateCollectionDateFilter: (
    start: FormattedDateType,
    end: FormattedDateType
  ) => void;
}

const CollectionDateFilter: FC<Props> = ({ updateCollectionDateFilter }) => {
  return (
    <DateFilter
      fieldKeyEnd="collectionDateEnd"
      fieldKeyStart="collectionDateStart"
      inputLabel="Collection Date"
      updateDateFilter={updateCollectionDateFilter}
    />
  );
};

export { CollectionDateFilter };
