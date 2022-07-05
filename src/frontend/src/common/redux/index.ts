import { AnyAction, applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { getLocalStorage } from "../utils/localStorage";
import { setGroupMiddleware } from "./middleware";

const getInitialState = () => {
  const storedGroupStr = getLocalStorage(ReduxPersistenceTokens.GROUP);
  const storedGroup = storedGroupStr ? parseInt(storedGroupStr) : null;

  const storedPathogenStr = getLocalStorage(ReduxPersistenceTokens.PATHOGEN);
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
  const { type, payload } = action;
  switch (type) {
    case CZGEReduxActions.SET_GROUP_ACTION_TYPE:
      return {
        ...state,
        current: {
          ...state.current,
          group: payload,
        },
      };
    case CZGEReduxActions.SET_PATHOGEN_ACTION_TYPE:
      return {
        ...state,
        current: {
          ...state.current,
          pathogen: payload,
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
