export const getLineageFromSampleLineages = (lineages: Lineage[]): Lineage =>
  lineages?.[0];

export const getLineageFromSample = (sample: Sample): string | undefined => {
  return sample?.lineages?.[0]?.lineage;
};
