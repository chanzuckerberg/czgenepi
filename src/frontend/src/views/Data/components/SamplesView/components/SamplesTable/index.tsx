import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSelector } from "src/common/redux/hooks";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { IdMap } from "src/common/utils/dataTransforms";
import Table from "src/components/Table";
import { SAMPLE_TABLE_COLUMNS } from "./pathogenColumnConfig";

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
  const pathogen = useSelector(selectCurrentPathogen);
  const columns: ColumnDef<Sample, any>[] = useMemo(
    () => SAMPLE_TABLE_COLUMNS[pathogen],
    [pathogen]
  );

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
