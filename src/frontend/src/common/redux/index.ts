import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { getLocalStorage } from "../utils/localStorage";

const getInitialState = () => {
  const storedGroup = getLocalStorage("currentGroup");
  const storedPathogen = getLocalStorage("currentPathogen");

  return {
    current: {
      group: storedGroup,
      pathogen: storedPathogen,
    },
  };
};

// set up redux store!
const reduxReducer = (state = getInitialState(), action) => {
  switch (action.type) {
    case "group/setGroup":
      return {
        ...state,
        current: {
          ...state.current,
          group: action.payload,
        },
      };
    case "pathogen/setPathogen":
      return {
        ...state,
        current: {
          ...state.current,
          pathogen: action.payload,
        },
      };
    default:
      return state;
  }
};

const composedEnhancer = composeWithDevTools();
export const store = createStore(reduxReducer, composedEnhancer);

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
