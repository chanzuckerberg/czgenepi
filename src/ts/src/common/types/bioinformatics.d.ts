/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface BioinformaticsType {
    [index: string]: JSONPrimitive;
}

interface Sample extends BioinformaticsType {
    type: "Sample";
    privateId: string;
    publicId: string;
    uploadDate: string;
    collectionDate: string;
    collectionLocation: string;
    gisaid?: string;
}

interface Tree extends BioinformaticsType {
    type: "Tree";
    id: string;
    pathogenGenomeCount: number;
    creationDate: string;
}
