import { Tab, Tabs } from "czifui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useNewPhyloRunInfo } from "src/common/queries/phyloRuns";
import { useNewSampleInfo } from "src/common/queries/samples";
import { ROUTES } from "src/common/routes";
import { Navigation } from "./style";

const DataNavigation = (): JSX.Element => {
  const [currentTab, setCurrentTab] = useState<string>();
  const [tabData, setTabData] = useState<Partial<DataCategory>[]>([]);

  const router = useRouter();
  const { asPath: currentPath } = router;

  const { data: samples } = useNewSampleInfo();
  const { data: phyloRuns } = useNewPhyloRunInfo();

  // Configure tabs that are shown on the data page. One tab per view.
  // TODO-TR (mlila): types
  useEffect(() => {
    const newTabData = [
      {
        data: samples ?? {},
        text: "Samples",
        to: ROUTES.DATA_SAMPLES,
      },
      {
        data: phyloRuns ?? {},
        text: "Phylogenetics Trees",
        to: ROUTES.PHYLO_TREES,
      },
    ];

    setTabData(newTabData);
  }, [samples, phyloRuns]);

  // set which tab is active
  useEffect(() => {
    tabData.forEach((d) => {
      if (currentPath.startsWith(d.to)) setCurrentTab(d.to);
    });
  }, [currentPath, tabData]);

  const handleTabClick: SecondaryTabEventHandler = (_, value) => {
    router.push(value);
  };

  return (
    <Navigation data-test-id="menu-items">
      <Tabs value={currentTab} sdsSize="large" onChange={handleTabClick}>
        {tabData.map((tab) => (
          <Tab
            key={tab.to}
            value={tab.to}
            label={tab.text}
            count={Object.keys(tab.data).length}
            data-test-id={`menu-item-${tab.to}`}
          />
        ))}
      </Tabs>
    </Navigation>
  );
};

export { DataNavigation };
