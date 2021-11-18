export interface MutationCallbacks<T> {
  onError: () => void;
  onSuccess: (data: T) => void;
}
