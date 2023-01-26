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
