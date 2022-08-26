export enum ROUTES {
  HOMEPAGE = "/",
  ACCOUNT = "/account",
  AGREE_TERMS = "/agreeTerms",
  BIOHUB = "https://www.czbiohub.org/",
  CAREERS = "https://chanzuckerberg.com/careers/career-opportunities/?initiative=science",
  CONTACT_US_EMAIL = "mailto:hello@czgenepi.org",
  CZI = "https://chanzuckerberg.com/",
  DATA = "/data",
  DATA_SAMPLES = "/data/samples",
  GISAID = "https://www.gisaid.org/",
  GITHUB = "https://github.com/chanzuckerberg/czgenepi/",
  GROUP = "/group",
  GROUP_DETAILS = "/group/details",
  GROUP_INVITATIONS = "/group/members/invitations",
  GROUP_MEMBERS = "/group/members",
  HELP_CENTER = "https://help.czgenepi.org",
  NEXTSTRAIN = "https://nextstrain.org/",
  PANGOLIN = "https://pangolin.cog-uk.io/",
  PHYLO_TREES = "/data/phylogenetic_trees",
  PRIVACY = "/privacy",
  PRIVACY_DATA_SHARING_FAQ = "https://help.czgenepi.org/hc/en-us/sections/6406789491732",
  REQUEST_ACCESS = "https://airtable.com/shrblHnTRd9dtu6c0",
  RESOURCES = "https://help.czgenepi.org/hc/en-us/categories/6217716150804-Genomic-Epidemiology-Learning-Center",
  TERMS = "/terms",
  UPLOAD = "/upload",
  UPLOAD_STEP1 = "/upload/step1",
  UPLOAD_STEP2 = "/upload/step2",
  UPLOAD_STEP3 = "/upload/step3",
  USHER = "https://genome.ucsc.edu/cgi-bin/hgPhyloPlace",
}

export const publicPaths: string[] = [
  ROUTES.HOMEPAGE,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
];

export const workspacePaths: string[] = [
  ROUTES.DATA,
  ROUTES.PHYLO_TREES,
  ROUTES.UPLOAD,
];
