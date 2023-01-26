interface SubHeader extends Header {
  sortKey?: string[];
}

export type TooltipTextType = {
  boldText: string;
  regularText: string;
  link?: {
    href: string;
    linkText: string;
  };
};

export interface Header {
  text: string;
  key: string;
  sortKey: string[];
  align?: string;
  subHeaders?: SubHeader[];
  tooltip?: TooltipTextType;
}
