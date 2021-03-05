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

const Samples: FunctionComponent<Props> = ({ data }: Props) => {
    // we are modifying state using hooks, so we need a reducer
    const [state, dispatch] = useReducer(searchReducer, {
        searching: false,
        results: undefined,
    });

    // search functions
    const searcher = (
        event: React.ChangeEvent<HTMLInputElement>,
        fieldInput: InputOnChangeData
    ) => {
        const query = fieldInput.value;
        if (data === undefined) {
            return;
        } else if (query.length === 0) {
            dispatch({ results: data });
            return;
        }

        dispatch({ searching: true });

        const regex = new RegExp(escapeRegExp(query), "i");
        const filteredSamples = data.filter((sample) => {
            return Object.values(sample).some((value) => regex.test(value));
        });

        dispatch({ searching: false, results: filteredSamples });
    };

    const render = (tableData: Array<Sample>) => {
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
                    <SamplesTable data={tableData} />
                </div>
            </div>
        );
    }

    if (state.results === undefined) {
        let tableData: Array<Sample> = [];
        if (data !== undefined) {
            dispatch({ results: data })
            tableData = data;
        }
        return render(tableData)
    }

    return render(state.results)
};

export default Samples;
