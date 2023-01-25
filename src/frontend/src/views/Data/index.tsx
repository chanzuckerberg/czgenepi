import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { useProtectedRoute } from "src/common/queries/auth";
import { TabData } from "src/common/types/data";
import { VIEWNAME } from "../../common/constants/types";
import { ROUTES } from "../../common/routes";
import { SamplesView } from "./components/SamplesView";
import { TreesView } from "./components/TreesView";
import { Container, StyledView } from "./style";

const Data: FunctionComponent = () => {
  useProtectedRoute();

  // possible tabs the user can switch to
  const tabs: TabData[] = [
    {
      text: VIEWNAME.SAMPLES,
      to: ROUTES.DATA_SAMPLES,
    },
    {
      text: VIEWNAME.TREES,
      to: ROUTES.PHYLO_TREES,
    },
  ];

  // determine which tab the user is currently viewing
  const router = useRouter();
  const { asPath: currentPath } = router;
  const currentTab =
    tabs.find((tab) => currentPath.startsWith(tab.to)) || tabs[0];
  const viewName = currentTab.text;

  return (
    <Container>
      <StyledView>
        {viewName === VIEWNAME.SAMPLES && <SamplesView />}
        {viewName === VIEWNAME.TREES && <TreesView />}
      </StyledView>
    </Container>
  );
};

export default Data;
