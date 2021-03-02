/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface Group {
    [index: string]: JSONPrimitive;
    address: string;
    email: string;
    id: number;
    name: string;
}

interface User {
    [index: string]: JSONPrimitive;
    auth0UserId: string;
    email: string;
    groupAdmin: boolean;
    groupId: number;
    id: number;
    name: string;
    systemAdmin: boolean;
}
