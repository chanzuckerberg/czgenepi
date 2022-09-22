export const SAMPLE_PAGE = {
  GENOME_RECOVERY_DROPDOWN: "button[label='Genome Recovery']",
  GENOME_RECOVERY_OPTIONS: "div[role='tooltip'] li span.primary-text",
  LINEAGE_DROPDOWN: "button[label='Lineage']",
  SAMPLE_COLLECTION_DATE: "button[label='Collection Date']",
  SAMPLE_LINEAGE: "div[data-test-id='table-row'] > div:nth-of-type(4) > div",
  SAMPLE_STATUS: "div[data-test-id='sample-status']",
  UPLOAD_BTN: "a[href='/upload/step1']",
};

export const footer: Record<string, string> = {
  Github: "https://github.com/chanzuckerberg/czgenepi/",
  Careers:
    "https://chanzuckerberg.com/careers/career-opportunities/?initiative=science",
  "Learning Center":
    "https://help.czgenepi.org/hc/en-us/categories/6217716150804-Genomic-Epidemiology-Learning-Center",
};
