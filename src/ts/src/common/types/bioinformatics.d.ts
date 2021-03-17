interface BioinformaticsType {
    [index: string]: JSONPrimitive;
    type: "BioinformaticsType";
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
    [index: string]: JSONPrimitive | JSX.Element;
    type: "Tree";
    id: number;
    name?: string;
    pathogenGenomeCount: number;
    dateCompleted: string;
    downloadLink?: JSX.Element;
}

type BioinformaticsData = Sample | Tree;
