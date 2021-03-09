import React, { FunctionComponent, useState, useEffect } from "react";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import cx from "classnames";

import { fetchSamples, fetchTrees } from "common/api";

import Samples from "./samples";

import style from "./index.module.scss";

const Data: FunctionComponent = () => {
    const [samples, setSamples] = useState<Array<Sample> | undefined>();
    const [trees, setTrees] = useState<Array<Tree> | undefined>();

    useEffect(() => {
        const setBioinformaticsData = async () => {
            const [apiSamples, apiTrees] = [fetchSamples(), fetchTrees()];
            setSamples(await apiSamples);
            setTrees(await apiTrees);
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
            jsx: <Samples data={samples} />,
        },
        {
            to: "/data/phylogenetic_trees",
            text: "Phylogenetic Trees",
            data: trees,
            jsx: <div>{trees?.length} Trees</div>,
        },
    ];

    const dataJSX: Record<string, Array<JSX.Element>> = {
        menuItems: [],
        routes: [],
    };

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
                render={() => category.jsx}
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
