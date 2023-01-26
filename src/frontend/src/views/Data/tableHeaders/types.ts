export interface SubHeader {
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

export interface TableHeader<T> {
  text: string;
  key: keyof T;
  align?: string;
  subHeaders?: SubHeader[];
  tooltip?: TooltipTextType;
}
