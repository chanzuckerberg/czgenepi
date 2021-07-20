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
  return <span />;
};

export default SentryWatcher;
