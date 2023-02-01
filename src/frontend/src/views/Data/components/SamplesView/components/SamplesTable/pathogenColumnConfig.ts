import { ColumnDef } from "@tanstack/react-table";
import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { collectionDateColumn } from "./columnDefinitions/collectionDate";
import { collectionLocationColumn } from "./columnDefinitions/collectionLocation";
import { gisaidColumn } from "./columnDefinitions/gisaid";
import { lineageColumn } from "./columnDefinitions/lineage";
import { privateIdColumn } from "./columnDefinitions/privateId";
import { publicIdColumn } from "./columnDefinitions/publicId";
import { qualityControlColumn } from "./columnDefinitions/qualityControl";
import { sequencingDateColumn } from "./columnDefinitions/sequencingDate";
import { uploadDateColumn } from "./columnDefinitions/uploadDate";

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
    gisaidColumn,
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
