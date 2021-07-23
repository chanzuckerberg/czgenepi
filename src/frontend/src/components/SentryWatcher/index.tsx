import * as Sentry from "@sentry/nextjs";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";

const SentryWatcher = (): JSX.Element => {
  const { data } = useUserInfo();
  if (data) {
    Sentry.setUser({
      group: data.group.name,
      name: data.user.name,
    });
  }

  console.log(process.env.DEPLOYMENT_STAGE)
  console.log(process.env.SENTRY_FRONTEND_DSN)
  console.log(process.env.SENTRY_AUTH_TOKEN)

  // intentional
  if (data) {
    throw new Error("RDEV error!");
  }

  return <span />;
};

export default SentryWatcher;
