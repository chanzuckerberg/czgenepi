import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import {
  LineageTooltipConfig,
  LineageTooltipProps,
} from "./lineageTooltipConfig";

export const LineageTooltip = ({
  children,
  lineage,
}: LineageTooltipProps): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);
  const Component = LineageTooltipConfig[pathogen];
  return <Component lineage={lineage}>{children}</Component>;
};
