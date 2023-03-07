import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { NSAcknowledgement } from "./components/NSAcknowledement";
import { NcbiVirusAcknowledgement } from "./components/NcbiVirusAcknowledgement";

export const AcknowledgementConfig: PathogenConfigType<() => JSX.Element> = {
  [Pathogen.COVID]: NSAcknowledgement,
  [Pathogen.MONKEY_POX]: NcbiVirusAcknowledgement,
};
