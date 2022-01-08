import React, { FC } from "react";
import { UpdateDateFilterType } from "../..";
import { DateFilter, DateMenuOption } from "../DateFilter";

const MENU_OPTIONS_UPLOAD_DATE: DateMenuOption[] = [
  {
    name: "Today",
    numDaysStartOffset: 0,
  },
  {
    name: "Yesterday",
    numDaysEndOffset: 1,
    numDaysStartOffset: 1,
  },
  {
    name: "Last 7 Days",
    numDaysStartOffset: 7,
  },
];

interface Props {
  updateUploadDateFilter: UpdateDateFilterType;
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
