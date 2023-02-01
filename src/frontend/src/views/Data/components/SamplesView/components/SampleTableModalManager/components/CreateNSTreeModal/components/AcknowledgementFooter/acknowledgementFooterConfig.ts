import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { GisaidAcknowlegementFooter } from "./components/GisaidAcknowledgementFooter";

export const AcknowledgementFooterConfig: PathogenConfigType<
  (() => JSX.Element) | null
> = {
  [Pathogen.COVID]: GisaidAcknowlegementFooter,
  [Pathogen.MONKEY_POX]: null,
};
