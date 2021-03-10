import React, { FunctionComponent, useReducer } from "react";
import { Input } from "semantic-ui-react";
import { escapeRegExp } from "lodash/fp";

import { DataTable } from "common/components";

import style from "./index.module.scss";

interface Props {
    data?: BioinformaticsData[];
    headers: Header[];
}

interface InputOnChangeData {
    [key: string]: string;
    value: string;
}

interface SearchState {
    searching?: boolean;
    results?: BioinformaticsData[];
}

function searchReducer(state: SearchState, action: SearchState): SearchState {
    return { ...state, ...action };
}

const DataSubview: FunctionComponent<Props> = ({ data, headers }: Props) => {
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
        if (data === undefined) {
            return;
        } else if (query.length === 0) {
            dispatch({ results: data });
            return;
        }

        dispatch({ searching: true });

        const regex = new RegExp(escapeRegExp(query), "i");
        const filteredData = data.filter((item) =>
            Object.values(item).some((value) => regex.test(`${value}`))
        );

        dispatch({ searching: false, results: filteredData });
    };

    const render = (tableData: BioinformaticsData[]) => {
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
                    <DataTable data={tableData} headers={headers} />
                </div>
            </div>
        );
    };

    if (state.results === undefined) {
        let tableData: BioinformaticsData[] = [];
        if (data !== undefined) {
            dispatch({ results: data });
            tableData = data;
        }
        return render(tableData);
    }

    return render(state.results);
};

export { DataSubview };
