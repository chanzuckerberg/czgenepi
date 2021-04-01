interface Header {
    [index: string]: string;
    text: string;
    key: string | number;
}

interface CustomTableRenderProps {
    value: JSONPrimitive | undefined;
    header: Header;
    index: number;
}

interface CustomRenderer extends FunctionComponent<CustomTableRenderProps> {
    ({ value, header, index }): JSX.Element;
}

type CellRenderer = (value: JSONPrimitive, index: number) => JSX.Element;
