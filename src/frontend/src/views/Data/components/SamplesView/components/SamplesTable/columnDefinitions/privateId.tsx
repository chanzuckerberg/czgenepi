import { ColumnDef } from "@tanstack/react-table";
import { Icon } from "czifui";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledPrivateId } from "./style";

// (mlila): The group that represents sample uploads or tree
// generations made by CZI
const CZ_BIOHUB_GROUP = "CZI";

export const privateIdColumn: ColumnDef<Sample, any> = {
  id: "privateId",
  accessorKey: "privateId",
  size: 250,
  enableSorting: true,
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Private ID",
        regularText:
          "User-provided private ID. Only users in your Group can see it.",
      }}
    >
      Private ID
    </SortableHeader>
  ),
  cell: memo(({ getValue, row, cell }) => {
    const { uploadedBy, private: isPrivate, submittingGroup } = row?.original;
    const uploader =
      submittingGroup?.name === CZ_BIOHUB_GROUP
        ? "CZ Biohub"
        : uploadedBy?.name;

    return (
      <StyledPrivateId
        key={cell.id}
        primaryText={getValue()}
        secondaryText={uploader}
        shouldTextWrap
        primaryTextWrapLineCount={1}
        icon={
          <Icon
            sdsIcon={isPrivate ? "flaskPrivate" : "flaskPublic"}
            sdsSize="xl"
            sdsType="static"
          />
        }
        tooltipProps={{
          sdsStyle: "light",
          arrow: false,
        }}
      />
    );
  }),
};
