interface Header {
  [index: string]: string | number | string[];
  text: string;
  key: string | number;
  sortKey: string[];
  align?: string;
}

interface SubHeader extends Header {
  sortKey?: string[];
}

type TableItem = Record<
  string | number,
  JSONPrimitive | Record<string, JSONPrimitive>
>;

interface CustomTableRenderProps {
  header: Header;
  value?: JSONPrimitive | Record<string, JSONPrimitive>;
  item: TableItem;
  index: number;
}

type CustomRenderer = ({
  header,
  value,
  item,
  index,
}: CustomTableRenderProps) => JSX.Element;

type CellRenderer = ({ value, item, index }: CellRendererProps) => JSX.Element;
