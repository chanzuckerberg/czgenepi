import { AnyAction, applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { fetchUserInfo } from "../queries/auth";
import { getLocalStorage } from "../utils/localStorage";
import { setGroup, setPathogen } from "./actions";
import { setGroupMiddleware, setPathogenMiddleware } from "./middleware";
import { CZGEReduxActions, Pathogen, ReduxPersistenceTokens } from "./types";

// first, load state from localstorage if any exists and use it to initialize redux
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
  if (!group) {
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
