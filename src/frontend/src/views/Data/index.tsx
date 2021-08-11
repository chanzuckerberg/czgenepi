import cx from "classnames";
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
import { ROUTES } from "../../common/routes";
import { SampleRenderer, TreeRenderer } from "./cellRenderers";
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
      text: "Samples",
      to: ROUTES.DATA_SAMPLES,
    },
    {
      data: trees,
      defaultSortKey: ["creationDate"],
      headers: TREE_HEADERS,
      isDataLoading,
      renderer: TreeRenderer,
      subheaders: EMPTY_OBJECT,
      text: "Phylogenetic Trees",
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

  return (
    <Container className={style.dataRoot}>
      <Head>
        <title>Aspen {title && " | " + title}</title>
      </Head>

      <div className={style.navigation} data-test-id="data-menu-items">
        <Menu className={style.menu} secondary>
          {dataJSX.menuItems}
        </Menu>
      </div>
      <FlexContainer className={style.view}>
        {category.text === "Samples" && <FilterPanel />}
        <DataSubview
          key={router.asPath}
          isLoading={category.isDataLoading}
          data={category.data}
          defaultSortKey={category.defaultSortKey}
          headers={category.headers}
          subheaders={category.subheaders}
          headerRenderer={category.headerRenderer}
          renderer={category.renderer}
          viewName={category.text}
        />
      </FlexContainer>
    </Container>
  );
};

export default Data;
