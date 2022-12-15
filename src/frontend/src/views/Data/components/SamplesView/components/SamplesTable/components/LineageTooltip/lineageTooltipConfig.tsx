import { ReactNode } from "react";
import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { CovidLineageTooltip } from "./components/CovidLineageTooltip";
import { GeneralViralLineageTooltip } from "./components/GeneralViralLineageTooltip";

export interface LineageTooltipProps {
  children: ReactNode;
  lineage: Lineage;
}

export const LineageTooltipConfig: PathogenConfigType<
  ({ children, lineage }: LineageTooltipProps) => JSX.Element
> = {
  [Pathogen.COVID]: CovidLineageTooltip,
  [Pathogen.MONKEY_POX]: GeneralViralLineageTooltip,
};
