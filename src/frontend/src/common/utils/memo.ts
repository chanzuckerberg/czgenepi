import React, { PropsWithChildren, SFC } from "react";

export const memo = <P extends Record<string, unknown>>(
  Component: SFC<P>,
  propsAreEqual?: (
    prevProps: Readonly<PropsWithChildren<P>>,
    nextProps: Readonly<PropsWithChildren<P>>
  ) => boolean
) => {
  const memoized = React.memo(Component, propsAreEqual);

  Object.defineProperty(memoized, "displayName", {
    set(name) {
      Component.displayName = name;
    },
  });

  return memoized;
};
