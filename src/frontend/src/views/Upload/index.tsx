import { forEach } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  AnalyticsSamplesUploadPageChange,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
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
const INITIAL_MATCHED_PATH = ""; // Default case, no path matched to component

export default function Upload(): JSX.Element | null {
  const { data, isLoading } = useProtectedRoute();
  const [samples, setSamples] = useState<ISamples | null>(null);
  const [metadata, setMetadata] = useState<SampleIdToMetadata | null>(null);
  /**
   * For analytics, we group all events in a single Upload "flow" to correlate.
   *
   * We generate a UUID at very start of the Upload process -- that is, this
   * component mounting -- then attach that ID to all analytics events around
   * that Upload "flow" so we can correlate the events during analysis.
   *
   * We have outstanding issues with repeated-mounts on components. See ticket:
   *   https://app.shortcut.com/genepi/story/204578
   * Because of that we have to use a workaround to avoid generating a UUID,
   * immediately using it for some event, then the page unmounting, remounting,
   * and thus getting a new UUID for subsequent events and breaking our ability
   * to correlate all the events of the flow. All the repeated mount "jitter"
   * tends to happen very quick, well under a second, so we just put a timeout
   * around the process of setting the flow's UUID. If the UUID gets set, we
   * can be very confident the re-mount "jitter" is over and things are stable.
   */
  const [analyticsFlowUuid, setAnalyticsFlowUuid] = useState<string>("");
  useEffect(() => {
    const establishUuid = () => {
      // `if` guard should be unnecessary. timeout + empty useEffect dep array
      // should ensure it only gets set once. Still, JIC, code defensively.
      if (!analyticsFlowUuid) {
        setAnalyticsFlowUuid(uuidv4());
      }
    }
    // In testing even with slow processor+network, 1sec safely passed jitter
    const timeoutID = setTimeout(establishUuid, 1000);
    // For a de-mount+re-mount, avoid setting the first go-around.
    return () => {
      clearTimeout(timeoutID);
    };
  }, [])
  const [analyticsLastSeenRoute, setAnalyticsLastSeenRoute] = useState(INITIAL_MATCHED_PATH);

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

  let matchedPath = INITIAL_MATCHED_PATH;
  const currentPath = router.asPath;

  forEach(Object.keys(routeToComponent), (route) => {
    if (currentPath.startsWith(route)) {
      matchedPath = route;
      // Fire analytics event if we see a new path get matched.
      if (matchedPath !== analyticsLastSeenRoute && analyticsFlowUuid) {
        analyticsTrackEvent<AnalyticsSamplesUploadPageChange>(
          EVENT_TYPES.SAMPLES_UPLOAD_PAGE_CHANGE,
          {
            prev_route: analyticsLastSeenRoute,
            new_route: matchedPath,
            upload_flow_uuid: analyticsFlowUuid,
          }
        );
        setAnalyticsLastSeenRoute(matchedPath);
      }
      return false; // short-circuit and end loop as soon as we match path
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
          analyticsFlowUuid={analyticsFlowUuid}
        />
      )}
    </StyledPageContent>
  );
}
