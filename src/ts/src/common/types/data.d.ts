interface Transform {
    key: string,
    inputs: string[],
    method: (inputs: any[]) => any
}
