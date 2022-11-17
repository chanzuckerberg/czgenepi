import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  GROUP_URL_INDICATOR,
  PATHOGEN_URL_INDICATOR,
} from "src/common/appRouting";
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
  const currentPathogen = useSelector(selectCurrentPathogen);

  const handleTabClick: PathogenTabEventHandler = (_, value) => {
    const currentRoute = router.asPath;

    const groupRegex = new RegExp(`${GROUP_URL_INDICATOR}\\/.*?(\\/|$)`);
    const groupUrlMatch = currentRoute.match(groupRegex);
    const groupUrl = groupUrlMatch ? groupUrlMatch[0] : "";

    // When the user changes between pathogens, we always start them on the samples page
    const newRoute = `${ROUTES.DATA_SAMPLES}/${groupUrl}${PATHOGEN_URL_INDICATOR}/${value}`;

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
