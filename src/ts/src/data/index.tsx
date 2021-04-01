import React, { FunctionComponent, useState, useEffect } from "react";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import cx from "classnames";

import { fetchSamples, fetchTrees } from "common/api";
import { DataSubview } from "common/components";

import { SAMPLE_HEADERS, TREE_HEADERS } from "./headers";
import { TREE_TRANSFORMS } from "./transforms";
import { SampleRenderer, TreeRenderer } from "./cellRenderers";

import style from "./index.module.scss";

const Data: FunctionComponent = () => {
    const [samples, setSamples] = useState<Sample[] | undefined>();
    const [trees, setTrees] = useState<Tree[] | undefined>();

    useEffect(() => {
        const setBioinformaticsData = async () => {
            const [sampleResponse, treeResponse] = await Promise.all([
                fetchSamples(),
                fetchTrees(),
            ]);
            const apiSamples = sampleResponse["samples"];
            const apiTrees = treeResponse["phylo_trees"];
            setSamples(apiSamples);
            setTrees(apiTrees);
        };
        setBioinformaticsData();
    }, []);

    // this constant is inside the component so we can associate
    // each category with its respective variable.
    const dataCategories = [
        {
            to: "/data/samples",
            text: "Samples",
            data: samples,
            headers: SAMPLE_HEADERS,
            renderer: SampleRenderer,
        },
        {
            to: "/data/phylogenetic_trees",
            text: "Phylogenetic Trees",
            data: trees,
            headers: TREE_HEADERS,
            transforms: TREE_TRANSFORMS,
            renderer: TreeRenderer,
        },
    ];

    // run data through transforms
    dataCategories.forEach((category) => {
        if (category.transforms === undefined || category.data === undefined) {
            return;
        }
        const transformedData = category.data.map((datum) => {
            const transformedDatum = Object.assign({}, datum);
            category.transforms.forEach((transform) => {
                const methodInputs = transform.inputs.map((key) => datum[key]);
                transformedDatum[transform.key] = transform.method(
                    methodInputs
                );
            });
            return transformedDatum;
        });
        category.data = transformedData;
    });

    const dataJSX: Record<string, Array<JSX.Element>> = {
        menuItems: [],
        routes: [],
    };

    // create JSX elements from categories
    dataCategories.forEach((category) => {
        let focusStyle = null;
        if (location.pathname === category.to) {
            focusStyle = style.active;
        }
        dataJSX.menuItems.push(
            <Link to={category.to} key={category.text}>
                <Menu.Item className={style.menuItem}>
                    <div className={style.category}>
                        <div className={cx(style.title, focusStyle)}>
                            {category.text}
                        </div>
                        <div className={style.count}>
                            {category.data?.length}
                        </div>
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
                        data={category.data}
                        headers={category.headers}
                        renderer={category.renderer}
                    />
                )}
            />
        );
    });

    return (
        <div className={style.dataRoot}>
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
        </div>
    );
};

export default Data;
