import { DataTable } from "common/components";
import { escapeRegExp } from "lodash/fp";
import React, { FunctionComponent, useReducer } from "react";
import { Input } from "semantic-ui-react";
import style from "./index.module.scss";

interface Props {
  data?: Record<string | number, JSONPrimitive>[];
  headers: Header[];
  renderer?: CustomRenderer;
}

interface InputOnChangeData {
  [key: string]: string;
  value: string;
}

interface SearchState {
  searching?: boolean;
  results?: Record<string | number, JSONPrimitive>[];
}

function searchReducer(state: SearchState, action: SearchState): SearchState {
  return { ...state, ...action };
}

const DataSubview: FunctionComponent<Props> = ({
  data,
  headers,
  renderer,
}: Props) => {
  // we are modifying state using hooks, so we need a reducer
  const [state, dispatch] = useReducer(searchReducer, {
    results: data,
    searching: false,
  });

  // search functions
  const searcher = (
    _event: React.ChangeEvent<HTMLInputElement>,
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

    dispatch({ results: filteredData, searching: false });
  };

  const render = (tableData: Record<string | number, JSONPrimitive>[]) => {
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
          <DataTable data={tableData} headers={headers} renderer={renderer} />
        </div>
      </div>
    );
  };

  if (state.results === undefined) {
    let tableData: Record<string | number, JSONPrimitive>[] = [];
    if (data !== undefined) {
      dispatch({ results: data });
      tableData = data;
    }
    return render(tableData);
  }

  return render(state.results);
};

export { DataSubview };
