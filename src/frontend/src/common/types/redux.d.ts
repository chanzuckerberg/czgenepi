type ActionType<T> = (payload: T | null) => {
  type: string;
  payload: T | null;
};

enum Pathogen {
  COVID = "covid",
}
