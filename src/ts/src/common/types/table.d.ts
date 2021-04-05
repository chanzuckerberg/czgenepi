interface Header {
    [index: string]: string;
    text: string;
    key: string | number;
}

interface CustomTableRenderProps {
    header: Header;
    value: JSONPrimitive | undefined;
    item: Record<string | number, JSONPrimitive>;
    index: number;
}

interface CustomRenderer extends FunctionComponent<CustomTableRenderProps> {
    ({ header, value, item, index }): JSX.Element;
}

type CellRenderer = (value: JSONPrimitive, item: Record<string | number, JSONPrimitive>, index: number) => JSX.Element;
