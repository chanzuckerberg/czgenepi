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

export interface MetadataExportHeader<T> {
  text: string;
  key: keyof T;
  subHeaders?: SubHeader[];
}
