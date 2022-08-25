import { Pathogen } from "../redux/types";

export enum BackendPathogen {
  COVID = "SC2",
}

export const pathogenMap: Record<Pathogen, BackendPathogen> = {
  [Pathogen.COVID]: BackendPathogen.COVID,
};

// TODO (mlila): a later PR will add query to BE for available pathogens
