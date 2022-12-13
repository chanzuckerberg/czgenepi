import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setPathogen } from "src/common/redux/actions";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { Pathogen } from "src/common/redux/types";
import { ROUTES } from "src/common/routes";
import { StyledTab, StyledTabs } from "./style";

type PathogenTabEventHandler = (
  event: React.SyntheticEvent<Element, Event>,
  tabsValue: Pathogen
) => void;

export const PathogenTabs = (): JSX.Element => {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentPathogen = useSelector(selectCurrentPathogen);

  const handleTabClick: PathogenTabEventHandler = (_, value) => {
    dispatch(setPathogen(value));
    router.push(ROUTES.DATA_SAMPLES);
  };

  return (
    <StyledTabs
      value={currentPathogen}
      onChange={handleTabClick}
      textColor="inherit"
    >
      <StyledTab value={Pathogen.COVID} label="SARS-CoV-2" />
      <StyledTab value={Pathogen.MONKEY_POX} label="Mpox" />
    </StyledTabs>
  );
};
