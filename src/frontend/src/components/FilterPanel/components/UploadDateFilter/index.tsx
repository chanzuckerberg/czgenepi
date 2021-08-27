import React, { FC } from "react";
import { DateFilter, FormattedDateType } from "../DateFilter";

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
    />
  );
};

export { UploadDateFilter };
