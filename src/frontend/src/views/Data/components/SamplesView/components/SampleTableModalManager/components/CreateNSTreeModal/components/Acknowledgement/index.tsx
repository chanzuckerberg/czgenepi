import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { AcknowledgementConfig } from "./acknowledgementConfig";

export const Acknowledgement = (): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);
  const Component = AcknowledgementConfig[pathogen];
  return <Component />;
};
