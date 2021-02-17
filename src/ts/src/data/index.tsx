import React, { FunctionComponent } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { Menu, Search, Container } from "semantic-ui-react";

import style from "./index.module.scss";

type Props = {
    samples?: Array<Sample>;
    trees?: Array<Tree>;
};

const Data: FunctionComponent<Props> = ({ samples = [], trees = [], children }) => {
    return (
        <div className={style.dataRoot}>
            <div className={style.navigation}>
                <Menu className={style.menu} pointing secondary>
                    <Container className={style.container} fluid>
                        <Menu.Item className={style.menuItem}>
                            <div className={style.searchBar}>
                                <Search />
                            </div>
                        </Menu.Item>
                        <Link to="/data/samples">
                        <Menu.Item className={style.menuItem}>
                            <div className={style.category}>
                                <span className={style.title}>Samples</span>
                                <span className={style.count}>{samples.length}</span>
                            </div>
                        </Menu.Item>
                        </Link>
                        <Link to="/data/trees">
                        <Menu.Item className={style.menuItem}>
                            <div className={style.category}>
                                <span className={style.title}>Phylogenetic Trees</span>
                                <span className={style.count}>{trees.length}</span>
                            </div>
                        </Menu.Item>
                        </Link>
                    </Container>
                </Menu>
            </div>
            <div className={style.view}>
                <Switch>
                    <Route path="/data/samples" render={() => <div>Samples</div>}/>
                    <Route path="/data/trees" render={() => <div>Phylogenetic Trees</div>}/>
                </Switch>
            </div>
        </div>
    )
}

export default Data;
