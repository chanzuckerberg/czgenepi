import { forEach } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ROUTES } from "src/common/routes";
import { SampleIdToMetadata } from "src/components/WebformTable/common/types";
import { useProtectedRoute } from "../../common/queries/auth";
import { useNamedLocations } from "../../common/queries/locations";
import { Props, Samples as ISamples } from "./components/common/types";
import { initSampleMetadata } from "./components/common/utils";
import Metadata from "./components/Metadata";
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

export default function Upload(): JSX.Element | null {
  const { data, isLoading } = useProtectedRoute();
  const [samples, setSamples] = useState<ISamples | null>(null);
  const [metadata, setMetadata] = useState<SampleIdToMetadata | null>(null);

  const router = useRouter();

  // To avoid possible race condition in Metadata upload where we need locations,
  // we fetch locations info early in parent container, so ready by that step.
  // FIXME (Vince): Need to put in place error handling if fetch fails.
  // Right now the use of empty array prevents a hard crash, but user will be
  // confused because page will seem fine but location finding just won't work.
  const { data: namedLocationsData } = useNamedLocations();
  const namedLocations =
    namedLocationsData?.namedLocations || ([] as NamedGisaidLocation[]);

  const cancelPrompt = useNavigationPrompt();

  // When user changes `samples`, prepare Metadata for later data entry.
  useEffect(() => {
    if (!samples) {
      return setMetadata(null);
    }

    const newMetadata: SampleIdToMetadata = {};
    for (const sampleId of Object.keys(samples)) {
      newMetadata[sampleId] = initSampleMetadata(sampleId);
    }
    setMetadata(newMetadata);
  }, [samples]);

  if (isLoading || !data) return <div>Loading...</div>;

  if (router.asPath === ROUTES.UPLOAD) {
    router.push(ROUTES.UPLOAD_STEP1);
  }

  let matchedPath = "";
  const currentPath = router.asPath;

  forEach(Object.keys(routeToComponent), (route) => {
    if (currentPath.startsWith(route)) {
      matchedPath = route;
      return false;
    }
  });

  const Component = routeToComponent[matchedPath as Routes] || null;

  return (
    <StyledPageContent>
      {Component && (
        <Component
          samples={samples}
          setSamples={setSamples}
          namedLocations={namedLocations}
          metadata={metadata}
          setMetadata={setMetadata}
          cancelPrompt={cancelPrompt}
        />
      )}
    </StyledPageContent>
  );
}
