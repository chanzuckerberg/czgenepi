import React, { FC } from "react";
import { FormattedDateType } from "src/components/DateField";
import { DateFilter, DateMenuOption } from "../DateFilter";


const MENU_OPTIONS_UPLOAD_DATE: DateMenuOption[] = [
  {
    name: "Today",
    numDaysStartOffset: 0,
  },
  {
    name: "Yesterday",
    numDaysStartOffset: 1,
    numDaysEndOffset: 1
  },
  {
    name: "Last 7 Days",
    numDaysStartOffset: 7
  },
];


interface Props {
  updateUploadDateFilter: (
    start: FormattedDateType,
    end: FormattedDateType
  ) => void;
}

const UploadDateFilter: FC<Props> = ({ updateUploadDateFilter }) => {
  return (
    <DateFilter
      fieldKeyEnd="uploadDateEnd"
      fieldKeyStart="uploadDateStart"
      inputLabel="Upload Date"
      updateDateFilter={updateUploadDateFilter}
      menuOptions={MENU_OPTIONS_UPLOAD_DATE}
    />
  );
};

export { UploadDateFilter };
