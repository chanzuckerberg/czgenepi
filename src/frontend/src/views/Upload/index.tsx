import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ROUTES } from "src/common/routes";
import { useProtectedRoute } from "../../common/queries/auth";
import {
  Metadata as IMetadata,
  Props,
  SampleIdToMetadata,
  Samples as ISamples,
} from "./components/common/types";
import Metadata from "./components/Metadata";
import Review from "./components/Review";
import Samples from "./components/Samples";
import { StyledPageContent } from "./style";

type Routes = ROUTES.UPLOAD_STEP1 | ROUTES.UPLOAD_STEP2 | ROUTES.UPLOAD_STEP3;

const routeToComponent: Record<Routes, (props: Props) => JSX.Element> = {
  [ROUTES.UPLOAD_STEP1]: Samples,
  [ROUTES.UPLOAD_STEP2]: Metadata,
  [ROUTES.UPLOAD_STEP3]: Review,
};

// DEBUG
// DEBUG
// DEBUG
// MOCK SAMPLES
const SAMPLES = {
  "GOOD-FILE-1": {
    filename: "sample1.fa",
    sequence:
      "TGCCTGGTTTCAACGAGAAAACACACGTACGTGGCTTTGGAGACTCCGTGGAGGAGGTGAGGCCAT",
  },
  "GOOD-FILE-2": {
    filename: "sample2.fa",
    sequence:
      "TGCAGGCTGCTTACGGTTTCGTCCGTGTTGCAGCCGAGGTTCATCTTAAAGATGGCACTTGTGGCTT",
  },
  "GOOD-FILE-3": {
    filename: "bad-sample.fa",
    sequence:
      "TGCAGGCTGCTTACGGTTTCGTCCGTGTTGCAGCCGATCATCAGCACATCAGTTTGCCTGTTTTACAGG",
  },
  "GOOD-FILE-4": {
    filename: "bad-sample.fa",
    sequence:
      "TGCAAACGAGAAAACACACGTCCAACTCAGTTTGCCGACGTCAACATCTTAAAGATGGCACTTGTGGCTT",
  },
};

const EMPTY_METADATA: IMetadata = {
  collectionDate: undefined,
  collectionLocation: undefined,
  islAccessionNumber: undefined,
  keepPrivate: undefined,
  publicId: undefined,
  sequencingDate: undefined,
  submittedToGisaid: undefined,
};

export default function Upload(): JSX.Element | null {
  const { data, isLoading } = useProtectedRoute();
  // DEBUG
  // DEBUG
  // DEBUG
  // MOCK DEFAULT WITH `SAMPLES`
  const [samples, setSamples] = useState<ISamples | null>(SAMPLES);
  const [metadata, setMetadata] = useState<SampleIdToMetadata | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!samples) {
      return setMetadata(null);
    }

    const newMetadata: SampleIdToMetadata = {};

    for (const sampleId of Object.keys(samples)) {
      newMetadata[sampleId] = EMPTY_METADATA;
    }

    setMetadata(newMetadata);
  }, [samples]);

  if (isLoading || !data) return <div>Loading...</div>;

  if (router.asPath === ROUTES.UPLOAD) {
    router.push(ROUTES.UPLOAD_STEP1);
  }

  const Component = routeToComponent[router.asPath as Routes] || null;

  return (
    <StyledPageContent>
      {Component && (
        <Component
          samples={samples}
          setSamples={setSamples}
          metadata={metadata}
          setMetadata={setMetadata}
        />
      )}
    </StyledPageContent>
  );
}
