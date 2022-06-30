import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { getLocalStorage } from "../utils/localStorage";
import {
  setGroupActionType,
  groupPersistedName,
  setPathogenActionType,
  pathogenPersistedName,
} from "./actions";
import { setGroupMiddleware } from "./middleware";

const getInitialState = () => {
  const storedGroup = parseInt(getLocalStorage(groupPersistedName));
  const storedPathogen = getLocalStorage(pathogenPersistedName);

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
    case setGroupActionType:
      return {
        ...state,
        current: {
          ...state.current,
          group: action.payload,
        },
      };
    case setPathogenActionType:
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

const composedEnhancer = composeWithDevTools(
  applyMiddleware(setGroupMiddleware)
);
export const store = createStore(reduxReducer, composedEnhancer);

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
