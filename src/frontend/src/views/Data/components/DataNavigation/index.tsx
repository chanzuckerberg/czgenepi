import { Tab } from "czifui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useNewPhyloRunInfo as usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { useNewSampleInfo as useSampleInfo } from "src/common/queries/samples";
import { ROUTES } from "src/common/routes";
import { DataCategory } from "src/common/types/data";
import { FilterPanelToggle } from "./FilterPanelToggle";
import { Navigation, StyledTabs } from "./style";

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
  const [tabData, setTabData] = useState<Partial<DataCategory>[]>([]);

  const router = useRouter();
  const { asPath: currentPath } = router;

  const { data: samples } = useSampleInfo();
  const { data: phyloRuns } = usePhyloRunInfo();

  // Configure tabs that are shown on the data page. One tab per view.
  useEffect(() => {
    const newTabData = [
      {
        count: samples && Object.keys(samples).length,
        text: "Samples",
        to: ROUTES.DATA_SAMPLES,
      },
      {
        count: phyloRuns && Object.keys(phyloRuns).length,
        text: "Phylogenetics Trees",
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
    // TODO-TR: smoother view transition
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
        {tabData.map((tab) => (
          <Tab
            key={tab.to}
            value={tab.to}
            label={tab.text}
            count={tab.count}
            data-test-id={`menu-item-${tab.to}`}
          />
        ))}
      </StyledTabs>
    </Navigation>
  );
};

export { DataNavigation };
