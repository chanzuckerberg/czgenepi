import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ROUTES } from "src/common/routes";
import { useProtectedRoute } from "../../common/queries/auth";
import {
  Props,
  SampleIdToMetadata,
  Samples as ISamples,
} from "./components/common/types";
import Metadata, { EMPTY_METADATA } from "./components/Metadata";
import Review from "./components/Review";
import Samples from "./components/Samples";
import { StyledPageContent } from "./style";
import { useNavigationPrompt } from "./useNavigationPrompt";

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
    filename: "sample3.fa",
    sequence:
      "TGCAGGCTGCTTACGGTTTCGTCCGTGTTGCAGCCGATCATCAGCACATCAGTTTGCCTGTTTTACAGG",
  },
  "GOOD-FILE-4": {
    filename: "sample4.fa",
    sequence:
      "TGCAAACGAGAAAACACACGTCCAACTCAGTTTGCCGACGTCAACATCTTAAAGATGGCACTTGTGGCTT",
  },
  "GOOD-FILE-5": {
    filename: "sample5.fa",
    sequence: "TGCAAACGAGAAAACACACGTCCATTTGCCGACATCTTAAAGATGGCACTTGTGGCTT",
  },
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

  useNavigationPrompt();

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
