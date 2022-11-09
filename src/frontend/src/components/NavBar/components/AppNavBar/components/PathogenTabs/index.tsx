import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { Pathogen } from "src/common/redux/types";
import { StyledTab, StyledTabs } from "./style";

type PathogenTabEventHandler = (
  event: React.SyntheticEvent<Element, Event>,
  tabsValue: Pathogen
) => void;

export const PathogenTabs = (): JSX.Element => {
  const router = useRouter();

  const currentPathogen = useSelector(selectCurrentPathogen);

  const handleTabClick: PathogenTabEventHandler = (_, value) => {
    const currentRoute = router.asPath;
    const newRoute = currentRoute.replace(
      /pathogen\/.*?(\/|$)/,
      `pathogen/${value}/`
    );
    router.push(newRoute);
  };

  return (
    <StyledTabs
      value={currentPathogen}
      onChange={handleTabClick}
      textColor="inherit"
    >
      <StyledTab value={Pathogen.COVID} label="SARS-CoV-2" />
      <StyledTab value={Pathogen.MONKEY_POX} label="Monkey Pox" />
    </StyledTabs>
  );
};
