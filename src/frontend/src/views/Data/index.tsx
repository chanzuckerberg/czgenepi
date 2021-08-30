import cx from "classnames";
import { compact, uniq } from "lodash";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Menu } from "semantic-ui-react";
import { fetchSamples, fetchTrees } from "src/common/api";
import { useProtectedRoute } from "src/common/queries/auth";
import { FilterPanel } from "src/components/FilterPanel";
import { DataSubview } from "../../common/components";
import { EMPTY_OBJECT } from "../../common/constants/empty";
import { VIEWNAME } from "../../common/constants/types";
import { ROUTES } from "../../common/routes";
import { SampleRenderer, TreeRenderer } from "./cellRenderers";
import { FilterPanelToggle } from "./components/FilterPanelToggle";
import { SampleHeader } from "./headerRenderer";
import { SAMPLE_HEADERS, SAMPLE_SUBHEADERS, TREE_HEADERS } from "./headers";
import style from "./index.module.scss";
import { Container, FlexContainer } from "./style";
import { TREE_TRANSFORMS } from "./transforms";

const TITLE: Record<string, string> = {
  [ROUTES.DATA_SAMPLES]: "Samples",
  [ROUTES.PHYLO_TREES]: "Phylogenetic Trees",
};

const Data: FunctionComponent = () => {
  useProtectedRoute();

  const [samples, setSamples] = useState<Sample[] | undefined>();
  const [trees, setTrees] = useState<Tree[] | undefined>();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [shouldShowFilters, setShouldShowFilters] = useState<boolean>(true);
  const [dataFilterFunc, setDataFilterFunc] = useState<any>();

  const router = useRouter();

  useEffect(() => {
    const setBioinformaticsData = async () => {
      setIsDataLoading(true);

      const [sampleResponse, treeResponse] = await Promise.all([
        fetchSamples(),
        fetchTrees(),
      ]);

      setIsDataLoading(false);

      const apiSamples = sampleResponse["samples"];
      // TODO: Support in-progress and failed trees
      const apiTrees = treeResponse["phylo_trees"].filter(
        (tree) => tree.status === "COMPLETED"
      );

      setSamples(apiSamples);
      setTrees(apiTrees);
    };

    setBioinformaticsData();
  }, []);

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
      headerRenderer: SampleHeader,
      headers: SAMPLE_HEADERS,
      isDataLoading,
      renderer: SampleRenderer,
      subheaders: SAMPLE_SUBHEADERS,
      text: VIEWNAME.SAMPLES,
      to: ROUTES.DATA_SAMPLES,
    },
    {
      data: trees,
      defaultSortKey: ["creationDate"],
      headers: TREE_HEADERS,
      isDataLoading,
      renderer: TreeRenderer,
      subheaders: EMPTY_OBJECT,
      text: VIEWNAME.TREES,
      to: ROUTES.PHYLO_TREES,
      transforms: TREE_TRANSFORMS,
    },
  ];

  // run data through transforms
  dataCategories.forEach((category) => {
    if (!category.transforms || !category.data) {
      return;
    }

    const transformedData = category.data.map((datum: BioinformaticsData) => {
      const transformedDatum = Object.assign({}, datum);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Asserted above
      category.transforms!.forEach((transform) => {
        const methodInputs = transform.inputs.map((key) => datum[key]);
        transformedDatum[transform.key] = transform.method(methodInputs);
      });

      return transformedDatum;
    });

    category.data = transformedData as BioinformaticsDataArray;
  });

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

  const title = TITLE[router.asPath];

  const category =
    dataCategories.find((category) => category.to === router.asPath) ||
    dataCategories[0];

  const viewName = category.text;

  // * (mlila): normally I would want to do this transfrom inside the component
  // * using the data, but LineageFilter renders a child compnent that seems
  // * to reference the parent's props (?). Passing in only the lineages, or
  // * incomplete options causes the component to break
  const sampleArr = viewName === "Samples" ? (category.data as Sample[]) : [];
  const lineages = uniq(compact(sampleArr?.map((d) => d.lineage?.lineage)))
    .sort()
    .map((l) => {
      return { name: l as string };
    });

  return (
    <Container className={style.dataRoot}>
      <Head>
        <title>Aspen {title && " | " + title}</title>
      </Head>

      <FlexContainer
        className={style.navigation}
        data-test-id="data-menu-items"
      >
        <FilterPanelToggle
          onClick={() => {
            setShouldShowFilters(!shouldShowFilters);
          }}
        />
        <Menu className={style.menu} secondary>
          {dataJSX.menuItems}
        </Menu>
      </FlexContainer>
      <FlexContainer className={style.view}>
        {viewName === "Samples" && shouldShowFilters && (
          // TODO (mlila): replace with sds filterpanel once it's complete
          <FilterPanel
            lineages={lineages}
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
          headerRenderer={category.headerRenderer}
          renderer={category.renderer}
          viewName={viewName}
          dataFilterFunc={viewName === "Samples" ? dataFilterFunc : undefined}
        />
      </FlexContainer>
    </Container>
  );
};

export default Data;
