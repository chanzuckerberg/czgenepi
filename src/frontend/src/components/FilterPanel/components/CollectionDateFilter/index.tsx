import { FC } from "react";
import { MENU_OPTIONS_COLLECTION_DATE } from "src/components/DateFilterMenu/constants";
import { DateFilter } from "../DateFilter";

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
