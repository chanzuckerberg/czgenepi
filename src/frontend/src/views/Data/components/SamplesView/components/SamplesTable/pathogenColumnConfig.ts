import { ColumnDef } from "@tanstack/react-table";
import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { collectionDateColumn } from "./columnDefinitions/collectionDate";
import { collectionLocationColumn } from "./columnDefinitions/collectionLocation";
import { lineageColumn } from "./columnDefinitions/lineage";
import { privateIdColumn } from "./columnDefinitions/privateId";
import { qualityControlColumn } from "./columnDefinitions/qualityControl";
import { sequencingDateColumn } from "./columnDefinitions/sequencingDate";
import { uploadDateColumn } from "./columnDefinitions/uploadDate";
import { publicIdColumn } from "./columnDefinitions/mpoxPublicId";

export const SAMPLE_TABLE_COLUMNS: PathogenConfigType<
  ColumnDef<Sample, any>[]
> = {
  [Pathogen.COVID]: [
    privateIdColumn,
    publicIdColumn,
    qualityControlColumn,
    uploadDateColumn,
    collectionDateColumn,
    lineageColumn,
    collectionLocationColumn,
    sequencingDateColumn,
  ],
  [Pathogen.MONKEY_POX]: [
    privateIdColumn,
    publicIdColumn,
    collectionDateColumn,
    lineageColumn,
    uploadDateColumn,
    collectionLocationColumn,
    sequencingDateColumn,
  ],
};
