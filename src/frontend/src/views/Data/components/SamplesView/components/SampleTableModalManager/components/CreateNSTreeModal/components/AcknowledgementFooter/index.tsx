import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { AcknowledgementFooterConfig } from "./acknowledgementFooterConfig";

export const AcknowledgementFooter = (): JSX.Element | null => {
  const pathogen = useSelector(selectCurrentPathogen);
  const Component = AcknowledgementFooterConfig[pathogen];
  return Component ? <Component /> : null;
};
