import { FC } from "react";
import { MENU_OPTIONS_UPLOAD_DATE } from "src/components/DateFilterMenu/constants";
import { DateFilter } from "../DateFilter";

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
