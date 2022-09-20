import { AnyAction, applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
import { setGroupMiddleware, setPathogenMiddleware } from "./middleware";
import { CZGEReduxActions, Pathogen, ReduxNotification } from "./types";
import {
  ensureValidGroup,
  getGroupIdFromLocalStorage,
} from "./utils/groupUtils";
import {
  ensureValidPathogen,
  getPathogenFromLocalStorage,
} from "./utils/pathogenUtils";

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

export const FALLBACK_GROUP_ID = -1;

// first, load state from localstorage if any exists and use it to initialize redux
const getInitialState = () => {
  const storedGroup = getGroupIdFromLocalStorage() ?? FALLBACK_GROUP_ID;
  const storedPathogen = getPathogenFromLocalStorage() ?? Pathogen.COVID;

  // TODO (mlila): remove test notifs
  const notifications: ReduxNotification[] = [{
    id: Date.now(),
    intent: "error",
    componentKey: NotificationComponents.CREATE_NS_TREE_FAILURE,
    shouldShowCloseButton: true,
  }, {
    id: Date.now() + 1,
    autoDismiss: 12000,
    intent: "info",
    componentKey: NotificationComponents.CREATE_NS_TREE_SUCCESS,
  }, {
    id: Date.now() + 2,
    autoDismiss: 12000,
    intent: "info",
    componentKey: NotificationComponents.CREATE_NS_TREE_SUCCESS,
  }];

  return {
    current: {
      group: storedGroup,
      pathogen: storedPathogen,
    },
    notifications,
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
    case CZGEReduxActions.ADD_NOTIFICATION_ACTION_TYPE:
      return {
        ...state,
        notifications: [...state.notifications, payload],
      };
    case CZGEReduxActions.DELETE_NOTIFICATION_ACTION_TYPE:
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== payload),
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
  const { getState } = store;
  const { current } = getState();
  const { group, pathogen } = current;

  // set user group
  if (group === FALLBACK_GROUP_ID) {
    ensureValidGroup();
  }

  // set pathogen
  if (!pathogen) ensureValidPathogen();
};

setDefaults();

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
