interface SubHeader extends Header {
  sortKey?: string[];
}
interface Header {
  text: string;
  key: string;
  sortKey: string[];
  align?: string;
  subHeaders?: SubHeader[];
  tooltip?: {
    boldText: string;
    regularText: string;
    link?: {
      linkText: string;
      href: string;
    };
  };
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
  userInfo?: User;
  onDeleteTreeModalOpen(t: PhyloRun): void;
  onEditTreeModalOpen(t: PhyloRun): void;
}

type CustomRenderer = ({
  header,
  value,
  item,
  index,
  userInfo,
  onDeleteTreeModalOpen,
  onEditTreeModalOpen,
}: CustomTableRenderProps) => JSX.Element;

type CellRenderer = ({
  value,
  item,
  index,
  userInfo,
  onDeleteTreeModalOpen,
  onEditTreeModalOpen,
}: CellRendererProps) => JSX.Element;
