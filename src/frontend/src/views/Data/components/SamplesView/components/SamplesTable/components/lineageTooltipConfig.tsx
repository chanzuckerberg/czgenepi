import { ReactNode } from "react";
import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { CovidLineageTooltip } from "./CovidLineageTooltip";
import { GeneralViralLineageTooltip } from "./GeneralViralLineageTooltip";

export interface LineageTooltipProps {
  children: ReactNode;
  lineage: Lineage;
}

export const LineageTooltip: PathogenConfigType<
  ({ children, lineage }: LineageTooltipProps) => JSX.Element
> = {
  [Pathogen.COVID]: CovidLineageTooltip,
  [Pathogen.MONKEY_POX]: GeneralViralLineageTooltip,
};
