interface SubHeader {
  key: string;
  text: string;
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
  align?: string;
  subHeaders?: SubHeader[];
  tooltip?: TooltipTextType;
}
