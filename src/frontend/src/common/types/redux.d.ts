type ActionType<T> = (payload: T | null) => {
  type: CZGEReduxActions;
  payload: T | null;
};

enum Pathogen {
  COVID = "covid",
}

// export action type for use in reducers and middleware
enum CZGEReduxActions {
  SET_GROUP_ACTION_TYPE = "group/setGroup",
  SET_PATHOGEN_ACTION_TYPE = "pathogen/setPathogen",
}

// persisted names are for use in localstorage
enum ReduxPersistenceTokens {
  GROUP = "currentGroup",
  PATHOGEN = "currentPathogen",
}
