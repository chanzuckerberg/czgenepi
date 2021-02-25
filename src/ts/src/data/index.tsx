import React, { FunctionComponent } from "react";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import { Menu } from "semantic-ui-react";

import Samples from "./samples";

import style from "./index.module.scss";

type Props = {
    samples?: Array<Sample>;
    trees?: Array<Tree>;
};

const Data: FunctionComponent<Props> = ({
    samples = [],
    trees = [],
}: Props) => {
    // this constant is inside the component so we can associate
    // each category with its respective variable.
    const dataCategories = [
        {
            to: "/data/samples",
            text: "Samples",
            data: samples,
            component: <Samples />
        },
        {
            to: "/data/phylogenetic_trees",
            text: "Phylogenetic Trees",
            data: trees,
            component: undefined
        },
    ];

    const dataJSX: Record<string, Array<JSX.Element>> = {
        menuItems: [],
        routes: [],
    };

    dataCategories.forEach((category) => {
        dataJSX.menuItems.push(
            <Link to={category.to} key={category.text}>
                <Menu.Item className={style.menuItem}>
                    <div className={style.category}>
                        <span className={style.title}>{category.text}</span>
                        <span className={style.count}>
                            {category.data.length}
                        </span>
                    </div>
                </Menu.Item>
            </Link>
        );

        let categoryView: (() => JSX.Element) = () => {
            if (category.component === undefined) {
                return (<div>{category.text}</div>)
            } else {
                return category.component
            }
        }

        dataJSX.routes.push(
            <Route
                path={category.to}
                key={category.text}
                render={categoryView}
            />
        );
    });

    return (
        <div className={style.dataRoot}>
            <div className={style.navigation}>
                <Menu className={style.menu} pointing secondary>
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
