/**
 * Standardized approach to providing HTML `head` `title` for pages.
 *
 * Just a thin wrapper around using the `next/head` Head component, but mostly
 * here as way of standardizing how we do the head page title throughout app.
 * Use the component at a top-level page view and it will take care of the rest.
 * If you need to do more interesting things with the `<head>` than just setting
 * the page title, import the `makeHeadTitle` function on its own, then use that
 * in a custom Head for the specific page with special requirements.
 */
import Head from "next/head";
import React from "react";

const APP_NAME = "CZ GEN EPI";

interface Props {
  subTitle?: string;
}

// Create the page title according to how we structure them.
function makeHeadTitle(subTitle?: string): string {
  let headTitle: string = APP_NAME;
  if (subTitle) {
    headTitle = `${APP_NAME} | ${subTitle}`;
  }
  return headTitle;
}

function HeadAppTitle({ subTitle }: Props): JSX.Element {
  const headTitle = makeHeadTitle(subTitle);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
    </>
  );
}

export { HeadAppTitle };
