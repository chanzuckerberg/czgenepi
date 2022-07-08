import { AnyAction, applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { fetchUserInfo } from "../queries/auth";
import { getLocalStorage } from "../utils/localStorage";
import { setGroup, setPathogen } from "./actions";
import { setGroupMiddleware, setPathogenMiddleware } from "./middleware";
import { CZGEReduxActions, Pathogen, ReduxPersistenceTokens } from "./types";

/**
 * A note about how our redux store is initialized ...
 * Before we create the store, we make an initial state object.
 * We try to read from localstorage to create the initial state.
 * If we can't, we use reasonable defaults that match the types we want
 * each state field to have.
 * We create the store with the initial state, also registering middleware with it.
 * Then we set "true" defaults.
 * Why set defaults after instead of in initial state?
 * Because otherwise those updates cannot be persisted to localstorage using the predefined
 * middleware, since the store doesn't actually exist yet.
 * Although it would be possible to make requests to calculate and manually store the data,
 * this request would be async, meaning the state would not reliably be set before the ui
 * comes online.
 * So we have a compromise to use defaults for a fast initial hydration, and then immediately
 * make reqeusts for "true" default values from the server if needed.
 */

// first, load state from localstorage if any exists and use it to initialize redux
const getInitialState = () => {
  const storedGroupStr = getLocalStorage(ReduxPersistenceTokens.GROUP);
  const storedGroup = storedGroupStr ? parseInt(storedGroupStr) : -1;

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

// define how redux should merge changes into the state object
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

// actually instantiate the store here, using the localstorage values and
// state merging strategy defined above
const composedEnhancer = composeWithDevTools(
  applyMiddleware(setGroupMiddleware, setPathogenMiddleware)
);
export const store = createStore(reduxReducer, composedEnhancer);

// set reasonable defaults for required state if none were stored in the browser
const setDefaults = async () => {
  const { dispatch, getState } = store;
  const { current } = getState();
  const { group, pathogen } = current;

  // set user group
  if (group === -1) {
    const userInfo = await fetchUserInfo();
    const { groups } = userInfo;

    if (!groups) return;

    // sort groups by id to put the oldest one into the first position
    groups.sort((a, b) => (a.id > b.id ? 1 : -1));
    dispatch(setGroup(groups[0].id));
  }

  // set pathogen
  if (!pathogen) dispatch(setPathogen(Pathogen.COVID));
};

setDefaults();

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
