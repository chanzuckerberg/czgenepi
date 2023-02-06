import { Tab } from "czifui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { useSampleInfo } from "src/common/queries/samples";
import { ROUTES } from "src/common/routes";
import { FilterPanelToggle } from "./FilterPanelToggle";
import { Navigation, StyledTabs } from "./style";
import { TabData } from "../../types";
import { VIEWNAME } from "src/common/constants/types";

// either all the props for sample filter panel are passed
// or no props are passed
type Props =
  | {
      activeFilterCount: number;
      shouldShowSampleFilterToggle: boolean;
      toggleFilterPanel(): void;
    }
  | Record<string, never>;

type TabEventHandler = (
  event: React.SyntheticEvent<Element, Event>,
  tabsValue: ROUTES
) => void;

const DataNavigation = ({
  activeFilterCount,
  shouldShowSampleFilterToggle,
  toggleFilterPanel,
}: Props): JSX.Element => {
  const [currentTab, setCurrentTab] = useState<ROUTES>(ROUTES.DATA_SAMPLES);
  const [tabData, setTabData] = useState<TabData[]>([]);

  const router = useRouter();
  const { asPath: currentPath } = router;

  const { data: samples } = useSampleInfo();
  const { data: phyloRuns } = usePhyloRunInfo();

  // Configure tabs that are shown on the data page. One tab per view.
  useEffect(() => {
    const newTabData = [
      {
        count: samples && Object.keys(samples).length,
        text: VIEWNAME.SAMPLES,
        to: ROUTES.DATA_SAMPLES,
      },
      {
        count: phyloRuns && Object.keys(phyloRuns).length,
        text: VIEWNAME.TREES,
        to: ROUTES.PHYLO_TREES,
      },
    ];

    setTabData(newTabData);
  }, [samples, phyloRuns]);

  // set which tab is active
  useEffect(() => {
    tabData.forEach((d) => {
      const { to } = d;
      if (!to) return;

      if (currentPath.startsWith(to)) setCurrentTab(to);
    });
  }, [currentPath, tabData]);

  const handleTabClick: TabEventHandler = (_, value) => {
    router.push(value);
  };

  return (
    <Navigation data-test-id="menu-items">
      {shouldShowSampleFilterToggle && (
        <FilterPanelToggle
          activeFilterCount={activeFilterCount}
          onClick={toggleFilterPanel}
        />
      )}
      <StyledTabs value={currentTab} sdsSize="large" onChange={handleTabClick}>
        {tabData.map((tab) => {
          return (
            <Tab
              key={tab.to}
              value={tab.to}
              label={tab.text}
              count={tab.count}
              data-test-id={`menu-item-${tab.to}`}
            />
          );
        })}
      </StyledTabs>
    </Navigation>
  );
};

export { DataNavigation };
