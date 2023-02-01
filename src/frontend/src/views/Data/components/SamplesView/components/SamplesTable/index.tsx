import { ColumnDef } from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import Table from "src/components/Table";
import { privateIdColumn } from "./columnDefinitions/privateId";
import { publicIdColumn } from "./columnDefinitions/publicId";
import { qualityControlColumn } from "./columnDefinitions/qualityControl";
import { uploadDateColumn } from "./columnDefinitions/uploadDate";
import { collectionDateColumn } from "./columnDefinitions/collectionDate";
import { lineageColumn } from "./columnDefinitions/lineage";
import { collectionLocationColumn } from "./columnDefinitions/collectionLocation";
import { sequencingDateColumn } from "./columnDefinitions/sequencingDate";
import { gisaidColumn } from "./columnDefinitions/gisaid";

const columns: ColumnDef<Sample, any>[] = [
  privateIdColumn,
  publicIdColumn,
  qualityControlColumn,
  uploadDateColumn,
  collectionDateColumn,
  lineageColumn,
  collectionLocationColumn,
  sequencingDateColumn,
  gisaidColumn,
];

interface Props {
  data: IdMap<Sample> | undefined;
  isLoading: boolean;
  setCheckedSamples(samples: Sample[]): void;
}

const SamplesTable = ({
  data,
  isLoading,
  setCheckedSamples,
}: Props): JSX.Element => {
  return (
    <Table<Sample>
      columns={columns}
      isLoading={isLoading}
      initialSortKey="uploadDate"
      tableData={data}
      onSetCheckedRows={setCheckedSamples}
      enableMultiRowSelection
    />
  );
};

export { SamplesTable };
