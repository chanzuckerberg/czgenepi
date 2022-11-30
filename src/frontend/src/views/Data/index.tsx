import { useTreatments } from "@splitsoftware/splitio-react";
import { compact, map, uniq } from "lodash";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useProtectedRoute } from "src/common/queries/auth";
import { usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { useSampleInfo } from "src/common/queries/samples";
import { DataCategory, Transform } from "src/common/types/data";
import {
  IdMap,
  reduceObjectArrayToLookupDict,
} from "src/common/utils/dataTransforms";
import { FilterPanel } from "src/components/FilterPanel";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { DataSubview } from "../../common/components";
import { EMPTY_OBJECT } from "../../common/constants/empty";
import { VIEWNAME } from "../../common/constants/types";
import { ROUTES } from "../../common/routes";
import { SampleRenderer, TreeRenderer } from "./cellRenderers";
import { FilterPanelToggle } from "./components/DataNavigation/FilterPanelToggle";
import { SamplesView } from "./components/SamplesView";
import { TreesView } from "./components/TreesView";
import { SAMPLE_HEADERS, SAMPLE_SUBHEADERS, TREE_HEADERS } from "./headers";
import {
  Category,
  CategoryTitle,
  Container,
  Navigation,
  StyledCount,
  StyledMenu,
  StyledMenuItem,
  StyledView,
  View,
} from "./style";
import { PHYLO_RUN_TRANSFORMS } from "./transforms";

// run data through transforms
const transformData = (
  data: BioinformaticsDataArray,
  keyedOn: string,
  transforms?: Transform[]
): IdMap<BioinformaticsData> => {
  if (!transforms || !data) {
    return reduceObjectArrayToLookupDict<BioinformaticsData>(data, keyedOn);
  }

  const transformedData = data.map((datum: BioinformaticsData) => {
    const transformedDatum = Object.assign({}, datum);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Asserted above
    transforms!.forEach((transform) => {
      const methodInputs = transform.inputs.map((key: string) => datum[key]);
      transformedDatum[transform.key] = transform.method(methodInputs);
    });
    return transformedDatum;
  }) as BioinformaticsDataArray;

  return reduceObjectArrayToLookupDict<BioinformaticsData>(
    transformedData,
    keyedOn
  );
};

const Data: FunctionComponent = () => {
  useProtectedRoute();

  const tableRefactorFlag = useTreatments([USER_FEATURE_FLAGS.table_refactor]);
  const usesTableRefactor = isUserFlagOn(
    tableRefactorFlag,
    USER_FEATURE_FLAGS.table_refactor
  );

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [shouldShowFilters, setShouldShowFilters] = useState<boolean>(true);
  const [dataFilterFunc, setDataFilterFunc] = useState<any>();
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

  const router = useRouter();
  const { asPath: currentPath } = router;

  const sampleResponse = useSampleInfo();
  console.log("sampleResponse", sampleResponse)
  const PhyloRunResponse = usePhyloRunInfo();
  const {
    data: sampleData,
    isLoading: isSampleInfoLoading,
    isFetching: isSampleInfoFetching,
  } = sampleResponse;
  const {
    data: phyloRunData,
    isLoading: isTreeInfoLoading,
    isFetching: isTreeInfoFetching,
  } = PhyloRunResponse;

  useEffect(() => {
    setIsDataLoading(true);
    if (
      isTreeInfoLoading ||
      isSampleInfoLoading ||
      isTreeInfoFetching ||
      isSampleInfoFetching
    )
      return;
    setIsDataLoading(false);
  }, [
    isTreeInfoLoading,
    isSampleInfoLoading,
    isTreeInfoFetching,
    isSampleInfoFetching,
  ]);

  const { samples, phyloRuns } = useMemo(
    () => ({
      samples: transformData(sampleData?.samples ?? [], "publicId"),
      phyloRuns: transformData(
        phyloRunData?.phylo_runs ?? [],
        "id",
        PHYLO_RUN_TRANSFORMS
      ),
    }),
    [sampleData, phyloRunData]
  );

  useEffect(() => {
    if (currentPath === ROUTES.DATA) {
      router.push(ROUTES.DATA_SAMPLES);
    }
  }, [router, currentPath]);

  // this constant is inside the component so we can associate
  // each category with its respective variable.
  const dataCategories: DataCategory[] = [
    {
      data: samples,
      defaultSortKey: ["uploadDate"],
      headers: SAMPLE_HEADERS,
      isDataLoading,
      renderer: SampleRenderer,
      subheaders: SAMPLE_SUBHEADERS,
      text: VIEWNAME.SAMPLES,
      to: ROUTES.DATA_SAMPLES,
    },
    {
      data: phyloRuns,
      defaultSortKey: ["startedDate"],
      headers: TREE_HEADERS,
      isDataLoading,
      renderer: TreeRenderer,
      subheaders: EMPTY_OBJECT,
      text: VIEWNAME.TREES,
      to: ROUTES.PHYLO_TREES,
    },
  ];

  const dataJSX: Record<string, Array<JSX.Element>> = {
    menuItems: [],
  };

  // create JSX elements from categories
  dataCategories.forEach((category) => {
    const item = category.text.replace(" ", "-").toLowerCase();
    dataJSX.menuItems.push(
      <StyledMenuItem key={category.text}>
        <NextLink href={category.to} key={category.text} passHref>
          <a href="passHref">
            <Category>
              <CategoryTitle
                isActive={currentPath.startsWith(category.to)}
                data-test-id={`menu-item-${item}`}
              >
                {category.text}
              </CategoryTitle>
              <StyledCount data-test-id={`menu-item-${item}-count`}>
                {Object.keys(category.data).length}
              </StyledCount>
            </Category>
          </a>
        </NextLink>
      </StyledMenuItem>
    );
  });

  const subTitle = currentPath.startsWith(ROUTES.DATA_SAMPLES)
    ? "Samples"
    : "Phylogenetic Trees";

  const category =
    dataCategories.find((category) => currentPath.startsWith(category.to)) ||
    dataCategories[0];

  const viewName = category.text;

  // * (mlila): normally I would want to do this transfrom inside the component
  // * using the data, but LineageFilter renders a child compnent that seems
  // * to reference the parent's props (?). Passing in only the lineages, or
  // * incomplete options causes the component to break
  const sampleMap = viewName === "Samples" ? (samples as SampleMap) : {};
  const lineages = uniq(compact(map(sampleMap, (d) => d.lineage?.lineage)))
    .sort()
    .map((l) => {
      return { name: l as string };
    });

  if (!usesTableRefactor) {
    return (
      <Container>
        <HeadAppTitle subTitle={subTitle} />

        <Navigation data-test-id="menu-items">
          <FilterPanelToggle
            activeFilterCount={activeFilterCount}
            onClick={() => {
              setShouldShowFilters(!shouldShowFilters);
            }}
          />
          <StyledMenu>{dataJSX.menuItems}</StyledMenu>
        </Navigation>
        <View>
          {viewName === "Samples" && (
            // TODO (mlila): replace with sds filterpanel once it's complete
            <FilterPanel
              lineages={lineages}
              isOpen={shouldShowFilters}
              setActiveFilterCount={setActiveFilterCount}
              setDataFilterFunc={setDataFilterFunc}
              data-test-id="menu-item-sample-count"
            />
          )}
          <DataSubview
            key={currentPath}
            isLoading={category.isDataLoading}
            data={category.data}
            defaultSortKey={category.defaultSortKey}
            headers={category.headers}
            subheaders={category.subheaders}
            renderer={category.renderer}
            viewName={viewName}
            dataFilterFunc={viewName === "Samples" ? dataFilterFunc : undefined}
          />
        </View>
      </Container>
    );
  }

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
