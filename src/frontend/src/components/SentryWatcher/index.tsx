import * as Sentry from "@sentry/nextjs";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import ENV from "src/common/constants/ENV";
import nodeEnv from "src/common/constants/nodeEnv";

const SentryWatcher = (): JSX.Element => {
  const { data } = useUserInfo();
  if (data) {
    Sentry.setUser({
      group: data.group.name,
      name: data.user.name,
    });
  }
  console.log("ENV", ENV)
  console.log("isProdBuild", ENV.NODE_ENV === nodeEnv.PRODUCTION)

  // now crash
  const test = {}
  console.log(test["crash"].push("please"))

  return <span />;
};

export default SentryWatcher;
