import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { GisaidAcknowledgement } from "./components/GisaidAcknowledement";
import { NcbiVirusAcknowledgement } from "./components/NcbiVirusAcknowledgement";

export const AcknowledgementConfig: PathogenConfigType<() => JSX.Element> = {
  [Pathogen.COVID]: GisaidAcknowledgement,
  [Pathogen.MONKEY_POX]: NcbiVirusAcknowledgement,
};
