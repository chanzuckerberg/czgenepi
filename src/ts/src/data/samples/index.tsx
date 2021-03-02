import React, { FunctionComponent, useReducer } from "react";
import { Input } from "semantic-ui-react";
import { escapeRegExp } from "lodash/fp";

import SamplesTable from "./SamplesTable";

import style from "./index.module.scss";

interface Props {
    data?: Array<Sample>;
}

interface InputOnChangeData {
    [key: string]: string;
    value: string;
}

interface SearchState {
    searching?: boolean;
    results?: Array<Sample>;
}

function searchReducer(state: SearchState, action: SearchState): SearchState {
    return { ...state, ...action };
}

// const dummySamples: Array<Sample> = [
//     {
//         privateId: "0865-0004KGK00-001",
//         publicId: "0909EEEE-55-33",
//         uploadDate: "2/1/2021",
//         collectionDate: "12/12/2020",
//         collectionLocation: "Santa Clara County",
//         gisaid: "Accepted",
//     },
//     {
//         privateId: "0865-0004KGK00-002",
//         publicId: "0909EEEE-55-34",
//         uploadDate: "2/1/2021",
//         collectionDate: "12/12/2020",
//         collectionLocation: "Santa Clara County",
//         gisaid: "Accepted",
//     },
// ];

const Samples: FunctionComponent<Props> = ({ data = [] }: Props) => {
    // we are modifying state using hooks, so we need a reducer
    const [state, dispatch] = useReducer(searchReducer, {
        searching: false,
        results: data,
    });

    // search functions
    const searcher = (
        event: React.ChangeEvent<HTMLInputElement>,
        fieldInput: InputOnChangeData
    ) => {
        const query = fieldInput.value;
        if (query.length === 0) {
            dispatch({ results: data });
            return;
        }

        dispatch({ searching: true });

        const regex = new RegExp(escapeRegExp(query), "i");
        const filteredSamples = data.filter((sample) => {
            let result = false;
            Object.values(sample).forEach(
                (value) => (result = result || regex.test(value))
            );
            return result;
        });

        dispatch({ searching: false, results: filteredSamples });
    };

    return (
        <div className={style.samplesRoot}>
            <div className={style.searchBar}>
                <Input
                    transparent
                    icon="search"
                    placeholder="Search"
                    loading={state.searching}
                    onChange={searcher}
                />
            </div>
            <div className={style.samplesTable}>
                <SamplesTable data={state.results} />
            </div>
        </div>
    );
};

export default Samples;
