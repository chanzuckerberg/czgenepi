export interface MutationCallbacks<T> {
  componentOnError: () => void;
  componentOnSuccess: (data?: T) => void;
}
