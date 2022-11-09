import { Tab, Tabs } from "czifui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNewPhyloRunInfo as usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { useNewSampleInfo as useSampleInfo } from "src/common/queries/samples";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { ROUTES } from "src/common/routes";
import { FilterPanelToggle } from "./FilterPanelToggle";
import { Navigation } from "./style";

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
  const [currentTab, setCurrentTab] = useState<string>(ROUTES.DATA_SAMPLES);
  const [tabData, setTabData] = useState<Partial<DataCategory>[]>([]);

  const router = useRouter();
  const { asPath: currentPath } = router;

  const pathogen = useSelector(selectCurrentPathogen);
  const { data: samples } = useSampleInfo(pathogen);
  const { data: phyloRuns } = usePhyloRunInfo(pathogen);

  // Configure tabs that are shown on the data page. One tab per view.
  // TODO-TR (mlila): types
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
      <Tabs value={currentTab} sdsSize="large" onChange={handleTabClick}>
        {tabData.map((tab) => (
          <Tab
            key={tab.to}
            value={tab.to}
            label={tab.text}
            count={tab.count}
            data-test-id={`menu-item-${tab.to}`}
          />
        ))}
      </Tabs>
    </Navigation>
  );
};

export { DataNavigation };
