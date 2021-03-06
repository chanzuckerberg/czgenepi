/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface Sample {
    [index: string]: string;
    type: "Sample";
    privateId: string;
    publicId: string;
    uploadDate: string;
    collectionDate: string;
    collectionLocation: string;
    gisaid?: string;
}

interface Tree {
    [index: string]: string | number;
    type: "Tree";
    id: string;
    pathogenGenomeCount: number;
    creationDate: string;
}

type BioinformaticsType = Sample | Tree;
