import { useRouter } from "next/router";
import { useEffect } from "react";
import { ROUTES } from "src/common/routes";

const MESSAGE =
  "Leave current upload? If you leave, your current upload " +
  "will be canceled and your work will not be saved.";

let leaveConfirmed = false;

export function useNavigationPrompt(message: string = MESSAGE): void {
  const router = useRouter();

  useEffect(() => {
    leaveConfirmed = false;
  }, []);

  useEffect(() => {
    const handleWindowClose = (event: BeforeUnloadEvent) => {
      /**
       * (thuang): The custom message doesn't work, but we still need to
       * assign returnValue for prompt to happen
       * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
       */
      event.preventDefault();
      event.returnValue = message;

      return message;
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, []);

  useEffect(() => {
    function handleRouteChangeStart(route: string) {
      if (route.includes(ROUTES.UPLOAD)) return;

      if (leaveConfirmed) return;

      if (window.confirm(message)) {
        leaveConfirmed = true;
      } else {
        router.events.emit("routeChangeError");
        throw "routeChange aborted";
      }
    }

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, []);
}
