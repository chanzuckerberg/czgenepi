/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface Sample {
    [index: string]: string;
    privateId: string;
    publicId: string;
    uploadDate: string;
    collectionDate: string;
    collectionLocation: string;
    gisaid?: string;
}

interface Tree {
    [index: string]: string | number;
    id: string;
    pathogenGenomeCount: number;
    creationDate: string;
}

type BioinformaticsType = Sample | Tree
