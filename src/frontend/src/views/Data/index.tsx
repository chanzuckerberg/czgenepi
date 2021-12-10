import cx from "classnames";
import { compact, map, uniq } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Menu } from "semantic-ui-react";
import { HeadAppTitle } from "src/common/components";
import { useProtectedRoute } from "src/common/queries/auth";
import { useSampleInfo } from "src/common/queries/samples";
import { useTreeInfo } from "src/common/queries/trees";
import { FilterPanel } from "src/components/FilterPanel";
import { DataSubview } from "../../common/components";
import { EMPTY_OBJECT } from "../../common/constants/empty";
import { VIEWNAME } from "../../common/constants/types";
import { ROUTES } from "../../common/routes";
import { PAGE_TITLES } from "../../common/titles";
import { SampleRenderer, TreeRenderer } from "./cellRenderers";
import { FilterPanelToggle } from "./components/FilterPanelToggle";
import { SAMPLE_HEADERS, SAMPLE_SUBHEADERS, TREE_HEADERS } from "./headers";
import style from "./index.module.scss";
import { Container, FlexContainer } from "./style";
import { TREE_TRANSFORMS } from "./transforms";

// reduces an array of objects to a mapping between the keyString arg and the objects
// that make up the array. Effective for quickly looking up objects by id, for example.
const reduceObjectArrayToLookupDict = (
  arr: BioinformaticsDataArray,
  keyedOn: string
): BioinformaticsMap => {
  const keyValuePairs = arr.map((obj) => {
    const id = obj[keyedOn];
    return [id, obj];
  });
  return Object.fromEntries(keyValuePairs);
};

// run data through transforms
const transformData = (
  data: BioinformaticsDataArray,
  keyedOn: string,
  transforms?: Transform[]
): BioinformaticsMap => {
  if (!transforms || !data) {
    return reduceObjectArrayToLookupDict(data, keyedOn);
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

  return reduceObjectArrayToLookupDict(transformedData, keyedOn);
};

const Data: FunctionComponent = () => {
  useProtectedRoute();

  const [samples, setSamples] = useState<BioinformaticsMap | undefined>();
  const [trees, setTrees] = useState<BioinformaticsMap | undefined>();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [shouldShowFilters, setShouldShowFilters] = useState<boolean>(true);
  const [dataFilterFunc, setDataFilterFunc] = useState<any>();
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

  const router = useRouter();

  const sampleResponse = useSampleInfo();
  const treeResponse = useTreeInfo();

  useEffect(() => {
    const setBioinformaticsData = async () => {
      const { data: sampleData, isLoading: isSampleInfoLoading } =
        sampleResponse;
      const { data: treeData, isLoading: isTreeInfoLoading } = treeResponse;

      setIsDataLoading(true);
      if (isTreeInfoLoading || isSampleInfoLoading) return;
      setIsDataLoading(false);

      const samples = transformData(sampleData?.samples ?? [], "publicId");
      setSamples(samples);

      const trees = transformData(
        treeData?.phylo_trees ?? [],
        "id",
        TREE_TRANSFORMS
      );
      setTrees(trees);
    };

    setBioinformaticsData();
  }, [treeResponse, sampleResponse]);

  useEffect(() => {
    if (router.asPath === ROUTES.DATA) {
      router.push(ROUTES.DATA_SAMPLES);
    }
  }, [router]);

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
      data: trees,
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
    let focusStyle = null;

    if (router.asPath === category.to) {
      focusStyle = style.active;
    }

    dataJSX.menuItems.push(
      <Link href={category.to} key={category.text} passHref>
        <a href="passHref">
          <Menu.Item className={style.menuItem}>
            <div className={style.category}>
              <div
                className={cx(style.title, focusStyle)}
                data-test-id="data-menu-item"
              >
                {category.text}
              </div>
              <div className={style.count}>{category.data?.length}</div>
            </div>
          </Menu.Item>
        </a>
      </Link>
    );
  });

  const subTitle = PAGE_TITLES[router.asPath];

  const category =
    dataCategories.find((category) => category.to === router.asPath) ||
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

  return (
    <Container className={style.dataRoot}>
      <HeadAppTitle subTitle={subTitle} />

      <FlexContainer
        className={style.navigation}
        data-test-id="data-menu-items"
      >
        <FilterPanelToggle
          activeFilterCount={activeFilterCount}
          onClick={() => {
            setShouldShowFilters(!shouldShowFilters);
          }}
        />
        <Menu className={style.menu} secondary>
          {dataJSX.menuItems}
        </Menu>
      </FlexContainer>
      <FlexContainer className={style.view}>
        {viewName === "Samples" && (
          // TODO (mlila): replace with sds filterpanel once it's complete
          <FilterPanel
            lineages={lineages}
            isOpen={shouldShowFilters}
            setActiveFilterCount={setActiveFilterCount}
            setDataFilterFunc={setDataFilterFunc}
          />
        )}
        <DataSubview
          key={router.asPath}
          isLoading={category.isDataLoading}
          data={category.data}
          defaultSortKey={category.defaultSortKey}
          headers={category.headers}
          subheaders={category.subheaders}
          renderer={category.renderer}
          viewName={viewName}
          dataFilterFunc={viewName === "Samples" ? dataFilterFunc : undefined}
        />
      </FlexContainer>
    </Container>
  );
};

export default Data;
