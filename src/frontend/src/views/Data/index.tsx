import cx from "classnames";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { fetchSamples, fetchTrees } from "src/common/api";
import { DataSubview } from "src/common/components";
import { SampleRenderer, TreeRenderer } from "./cellRenderers";
import { SampleHeader } from "./headerRenderer";
import { SAMPLE_HEADERS, SAMPLE_SUBHEADERS, TREE_HEADERS } from "./headers";
import style from "./index.module.scss";
import { Container } from "./style";
import { TREE_TRANSFORMS } from "./transforms";

const Data: FunctionComponent = () => {
  const [samples, setSamples] = useState<Sample[] | undefined>();
  const [trees, setTrees] = useState<Tree[] | undefined>();
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const setBioinformaticsData = async () => {
      setIsDataLoading(true);

      const [sampleResponse, treeResponse] = await Promise.all([
        fetchSamples(),
        fetchTrees(),
      ]);

      setIsDataLoading(false);

      const apiSamples = sampleResponse["samples"];
      const apiTrees = treeResponse["phylo_trees"];

      setSamples(apiSamples);
      setTrees(apiTrees);
    };

    setBioinformaticsData();
  }, []);

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
      to: "/data/samples",
    },
    {
      data: trees,
      defaultSortKey: ["creationDate"],
      headers: TREE_HEADERS,
      isDataLoading,
      renderer: TreeRenderer,
      subheaders: {},
      text: "Phylogenetic Trees",
      to: "/data/phylogenetic_trees",
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
    routes: [],
  };

  // create JSX elements from categories
  dataCategories.forEach((category) => {
    let focusStyle = null;
    if (window.location.pathname === category.to) {
      focusStyle = style.active;
    }
    dataJSX.menuItems.push(
      <Link to={category.to} key={category.text}>
        <Menu.Item className={style.menuItem}>
          <div className={style.category}>
            <div className={cx(style.title, focusStyle)}>{category.text}</div>
            <div className={style.count}>{category.data?.length}</div>
          </div>
        </Menu.Item>
      </Link>
    );

    dataJSX.routes.push(
      <Route
        path={category.to}
        key={category.text}
        render={() => (
          <DataSubview
            isLoading={category.isDataLoading}
            data={category.data}
            defaultSortKey={category.defaultSortKey}
            headers={category.headers}
            subheaders={category.subheaders}
            headerRenderer={category.headerRenderer}
            renderer={category.renderer}
            viewName={category.text}
          />
        )}
      />
    );
  });

  return (
    <Container className={style.dataRoot}>
      <div className={style.navigation}>
        <Menu className={style.menu} secondary>
          {dataJSX.menuItems}
        </Menu>
      </div>
      <div className={style.view}>
        <Switch>
          {dataJSX.routes}
          <Redirect from="/data" to="/data/samples" exact />
        </Switch>
      </div>
    </Container>
  );
};

export default Data;
