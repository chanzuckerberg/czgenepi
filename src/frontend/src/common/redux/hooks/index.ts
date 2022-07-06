import {
  TypedUseSelectorHook,
  useDispatch as ReduxDispatch,
  useSelector as ReduxSelector,
} from "react-redux";
import type { AppDispatchType, RootStateType } from "src/common/redux";

// Typed hooks to use throughout the app instead of plain `useDispatch` and `useSelector`
export const useDispatch: () => AppDispatchType = ReduxDispatch;
export const useSelector: TypedUseSelectorHook<RootStateType> = ReduxSelector;
