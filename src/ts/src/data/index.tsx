import React, { FunctionComponent } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { Menu, Search, Container } from "semantic-ui-react";

import style from "./index.module.scss";

type Props = {
    samples?: Array<Sample>;
    trees?: Array<Tree>;
};

const Data: FunctionComponent<Props> = ({ samples = [], trees = [], children }) => {

    // this constant is inside the component so we can associate
    // each category with its respective variable.
    const dataCategories = [
        { to: "/data/samples", text: "Samples", data: samples },
        { to: "/data/phylogenetic_trees", text: "Phylogenetic Trees", data: trees }
    ]

    const dataJSX: Record<string, Array<JSX.Element>> = { menuItems: [], routes: [] }

    dataCategories.forEach(category => {
        dataJSX.menuItems.push(
            <Link to={category.to} key={category.text}>
                <Menu.Item className={style.menuItem}>
                    <div className={style.category}>
                        <span className={style.title}>{category.text}</span>
                        <span className={style.count}>{category.data.length}</span>
                    </div>
                </Menu.Item>
            </Link>
            );
        dataJSX.routes.push(
            <Route path={category.to} key={category.text} render={() => <div>{category.text}</div>}/>
        )
    })

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
                </Switch>
            </div>
        </div>
    )
}

export default Data;
