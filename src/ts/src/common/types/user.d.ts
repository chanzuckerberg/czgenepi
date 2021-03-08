interface Group {
    [index: string]: string;
    address: string;
    email: string;
    id: number;
    name: string;
}

interface User {
    [index: string]: number | string | boolean;
    auth0UserId: string;
    email: string;
    groupAdmin: boolean;
    groupId: number;
    id: number;
    name: string;
    systemAdmin: boolean;
}
