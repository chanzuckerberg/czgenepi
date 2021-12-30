import React, { FC } from "react";
import { UpdateDateFilterType } from "../..";
import { DateFilter, DateMenuOption } from "../DateFilter";

const MENU_OPTIONS_COLLECTION_DATE: DateMenuOption[] = [
  {
    name: "Last 7 Days",
    numDaysStartOffset: 7,
  },
  {
    name: "Last 30 Days",
    numDaysStartOffset: 30,
  },
  // Average month has ~30.4 days, so that's why the non-round numbers
  {
    name: "Last 3 Months",
    numDaysStartOffset: 91,
  },
  {
    name: "Last 6 Months",
    numDaysStartOffset: 182,
  },
  {
    name: "Last Year",
    numDaysStartOffset: 365,
  },
];

interface Props {
  updateCollectionDateFilter: UpdateDateFilterType;
}

const CollectionDateFilter: FC<Props> = ({ updateCollectionDateFilter }) => {
  return (
    <DateFilter
      fieldKeyEnd="collectionDateEnd"
      fieldKeyStart="collectionDateStart"
      inputLabel="Collection Date"
      updateDateFilter={updateCollectionDateFilter}
      menuOptions={MENU_OPTIONS_COLLECTION_DATE}
    />
  );
};

export { CollectionDateFilter };
