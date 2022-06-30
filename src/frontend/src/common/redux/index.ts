import { AnyAction, applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { getLocalStorage } from "../utils/localStorage";
import {
  groupPersistedName,
  pathogenPersistedName,
  setGroupActionType,
  setPathogenActionType,
} from "./actions";
import { setGroupMiddleware } from "./middleware";

const getInitialState = () => {
  const storedGroupStr = getLocalStorage(groupPersistedName);
  const storedGroup = storedGroupStr ? parseInt(storedGroupStr) : null;

  const storedPathogenStr = getLocalStorage(pathogenPersistedName);
  const storedPathogen =
    storedPathogenStr && storedPathogenStr in Pathogen
      ? storedPathogenStr
      : null;

  return {
    current: {
      group: storedGroup,
      pathogen: storedPathogen as Pathogen,
    },
  };
};

// set up redux store!
const reduxReducer = (state = getInitialState(), action: AnyAction) => {
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
