/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

type HostGenome = {
    id: number;
    name: string;
    samplesCount: number;
    erccOnly: boolean;
};

type Project = {
    id: number;
    name: string;
};

type Sample = {
    id: number;
    name: string;
    host_genome_id: number;
};

type Tree = {
    id: number;
    name: string;
};
