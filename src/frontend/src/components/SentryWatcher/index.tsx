import React, { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useUserInfo } from "src/common/queries/auth";

const SentryWatcher = (): JSX.Element => {
  const { data } = useUserInfo()
  if (data) {
    Sentry.setUser({
      name: data.user.name,
      group: data.group.name
    })
  }
  return (<span/>)
}

export default SentryWatcher;