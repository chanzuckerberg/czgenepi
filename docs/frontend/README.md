# Frontend Documentation 📓

## Intro

CZ Gen Epi frontend application is built with the following stack. If you are unfamiliar with any of them, please feel free to check out their documentations in the links below, or reach out to CZI Slack channels **#org-tech-frontend** and **#help-frontend** for help!

1. [TypeScript](https://www.typescriptlang.org/)
1. [React](https://reactjs.org/)
1. [Next.js](https://nextjs.org/)
1. [React-Query](https://react-query.tanstack.com/)
1. [Emotion](http://emotion.sh/)
1. [Material UI](https://material-ui.com/)
1. [czifui](https://github.com/chanzuckerberg/sci-components)
1. [Playwright](https://playwright.dev/)

## App Structure

Given the app is built with [Next.js](https://nextjs.org/), we structure the app following the building blocks required by Next.js. Below you will find a few directories that are important to be familiar with:

1. `frontend/public` - static assets that we need to expose directly through `https://czgenepi.org/*` live here. For example, <https://czgenepi.org/robots.txt>

1. `frontend/pages` - All route based pages need their corresponding page files in this folder, this is because Next.js uses a file-system based router.

   For examples:

   1. `./pages/index.tsx` maps to Homepage route: <https://czgenepi.org/>
   1. `./pages/terms.tsx` maps to Terms of Service route: <https://czgenepi.org/terms>
   1. `./pages/upload/[[...params]].tsx` maps to **any** Upload route: <https://czgenepi.org/upload/1>, <https://czgenepi.org/upload/2>, <https://czgenepi.org/upload/3>, etc.. Notice that we use double bracket filename here, since this file is a dynamic route page that catches all of its sub-routes. (Learn more about Next.js' dynamic routes [here](https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes))
   1. `./pages/_document.tsx` is used to customize our app's `<html>` and `<body>` tags. In our case, we need to add Material UI's server side rendering code here.
      1. [Material UI server rendering](https://material-ui.com/guides/server-rendering/)
      1. [Material UI server rendering + Next.js example repo](https://github.com/mui-org/material-ui/tree/master/examples/nextjs)
      1. [Customize Next.js `Document`](https://nextjs.org/docs/advanced-features/custom-document)
   1. `./pages/_app.tsx` is used to customize Next.js' `App` component, so we can add global enhancements here. Such as `<ThemeProvider />`, `<QueryClientProvider />`, etc..
      1. [Customize Next.js `App`](https://nextjs.org/docs/advanced-features/custom-app)
   1. Visit [here](https://nextjs.org/docs/routing/introduction) to learn more about Next.js' routing strategy

1. `frontend/src/common` - Anything that's shared globally live here. For examples, api, constants, styles, etc.. **Except for the shared components (see below)**

1. `frontend/src/components` - All shared components live here instead of `./src/common/components`, because `./src/components` is likely to grow a lot bigger and used frequently, so separating it out from `./src/common` as a shortcut to help with browsing and imports

1. `frontend/src/views` - All page files in `./pages` should have their corresponding view component files in this folder, where the implementation details live. For example, `./pages/index.tsx` imports `./views/Homepage` component and renders it like so:

   ```tsx
   import React from "react";
   import Homepage from "src/views/Homepage";

   const Page = (): JSX.Element => <Homepage />;

   export default Page;
   ```

   As you can see, page files are just thin wrappers for the view components. This is because implementation details all live in `frontend/src/*`, and `frontend/pages` is the only odd duck **NOT** under `frontend/src/*`, so we compromise by importing the view components from `frontend/src/views` and use them in `frontend/pages` to render the pages

## React Component Structure

The basic way to build a React component is to follow the steps below:

1. Create a component folder in the directory it belongs to. E.g., a view component lives in `./src/views/*` and a shared component in `./src/components/*`.

   For illustration, we will create a view component named `Foo` in `./src/views/Foo`

1. Create a new file `./src/views/Foo/index.tsx` - this is where the implementation details of `Foo` should live and how the call sites import the component

1. Create `./src/views/Foo/style.ts` to host all styled components you use in `./src/views/Foo/index.tsx`

1. Create `./src/views/Foo/components/` directory to host all sub-components you use in `./src/views/Foo/index.tsx`. For example, if you use component `<Bar />` in `<Foo>`, you can create a directory `./src/views/Foo/components/Bar` to encapsulate `Bar` component's implementation details.

1. And if `Bar` component uses `Baz`, we can create `./src/views/Foo/components/Bar/components/Baz` to encapsulate `Baz` component's implementation details

As you can see, a component is typically made of other components and/or sub-components, so we can use the basic component file structure illustrated above to recursively build out a component at any level. One benefit of this recursive structure is that the component interface and boundaries are well defined, so extracting a component to a different directory is as easy as cut and paste

## Data Fetching

CZ Gen Epi uses [React Query](https://react-query.tanstack.com/) and Web API [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make API call lifecycle and manage fetched server data. If you want to learn more about React Query and why it's awesome, please check out their [overview](https://react-query.tanstack.com/overview)!

We put all API queries inside `./common/queries`, and depends on the server data type, we further split the code into different files, such as `auth.ts` and `samples.ts`

For GET example, find function `useUserInfo()` in `./src/common/queries/auth.ts` and see how it incorporates `fetch()` and `useQuery`. And global search for `useUserInfo` to see how it's used at the call sites

For POST example, find function `createSamples()` in `./src/common/queries/samples.ts` and see how it incorporates `fetch()`. And global search for `createSamples` to see how the call sites use the POST function along with `useMutation()`. E.g., `./src/views/Upload/components/Review/components/Upload/index.tsx`

## Design System + Component Library ([czifui](https://github.com/chanzuckerberg/sci-components))

CZ Gen Epi uses Science Initiative Design System as the building blocks for composing UI, and `czifui` is the component library counterpart of the design system.

For referencing the design system, please check [Figma](https://www.figma.com/file/EaRifXLFs54XTjO1Mlszkg/Science-Design-System-Reference) and use the left panel to find different types of components (Bases, Genes, DNA, and Chromosomes) ![image](https://user-images.githubusercontent.com/6309723/123888574-a53aec00-d908-11eb-96b3-e32381e30c9a.png)

## Styling

CZ Gen Epi uses [Emotion](https://emotion.sh/), [Material UI](https://material-ui.com/), and Science Initiative component library ([czifui](https://github.com/chanzuckerberg/sci-components)) as the styling solution. This is because `czifui` also uses Emotion and Material UI, so sharing the same stack not only saves us bundle size, but also allows us to use the same styling strategies between the app and the library (less context switching and more code examples), as well as having an easier time to extract components from CZ Gen Epi to the library

Regarding Emotion, we mainly use the `styled()` approach to style components, since this is the recommended way to style components by Material UI (and MUI also uses Emotion)

For more details, visit Emotion's styled component doc [here](https://emotion.sh/docs/styled)

For using `czifui`, please visit the repo [here](https://github.com/chanzuckerberg/sci-components)

### Theming

CZ Gen Epi customizes the default `czifui` theme, in order to have its unique brand identity. As a result, when styling the components in CZ Gen Epi we need to use the custom theme object when writing CSS rules.

For example, throughout the code base, you will find patterns such as the following:

```ts
import { fontBodyM, getColors, getSpaces } from "czifui";

export const Foo = styled.div`
  // This is the design system's font body medium mixin we import from czifui
  ${fontBodyM}

  // This is where the regular css rules go
  overflow: auto;

  // This is a callback function that returns more CSS rules, but the only way
  // to access the custom theme object
  ${(props) => {
    // getColors() is a selector that picks out colors from the theme object
    const colors = getColors(props);
    // getSpaces() is a selector that picks out spaces from the theme object
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.gray[500]};
      padding-bottom: ${spaces?.m}px;
      margin-bottom: ${spaces?.xxl}px;
    `;
  }}
`;
```

## Feature Flags
The front end of CZ Gen Epi has a feature flag system that aids in developing features without creating huge, long running feature branches. This allows us to:
1. Develop multiple features in parallel with full visibility.
2. Develop front end features without showing our WIP dust to users.
3. Allow internal stakeholders to optionally view/hide WIP during development by modifying the app url.
4. Prevent drift between `trunk` and feature branches during development by removing the need for feature branches in many cases.

To add a new feature flag, create a new flag in `...../utils/featureFlags.tsx`. This creates a new flag that can be used to optionally show/hide components, or run/not run loops, logic, etc.

```
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";

const render = () => {
  if (usesFeatureFlag(FEATURE_FLAGS.mayasFlag)) {
    return <div>FEATURE FLAG IN USE...</div>;  // or whatever new feature you are writing
  }

  // the old/default code that the user should see until development is complete
  return <div>I'm the old feature</div>;
};
```

In order to see code hidden behind a feature flag, simply add a query parameter to the url in your address bar. For example, http://frontend.genepinet.localdev:8000/data/samples becomes http://frontend.genepinet.localdev:8000/data/samples?mayasFlag=true. Please note, the value _must_ be set to `true` in the query param to turn the feature flag on.

The feature flag will persist in local storage after it is set. That means *the feature flag will remain ON until you turn it off or clear your cookies, even if you do not modify url in the future*. As a result, please remember to clear your feature flags by periodically removing cookies, or by manually unsetting previously activated flags. For example, http://frontend.genepinet.localdev:8000/data/samples becomes http://frontend.genepinet.localdev:8000/data/samples?mayasFlag=false.

## Gotchas

1. CZ Gen Epi runs the whole stack in different Docker containers (via the `make local-*` commands), including the Frontend.

   However, there are times the FE container and `npm` packages can be out of sync. When it happens, you will experience different runtime errors in the app that **indirectly** suggests the FE container's `node_modules/` directory is out of sync, such as unable to find modules, library does not exist, etc.. When it happens, I typically use the following steps to troubleshoot:

   1. In CZ Gen Epi root directory (not FE root), run `docker-compose exec frontend /bin/bash` to SSH into the FE container

   1. In the FE container terminal, run `ls node_modules` to check the package of interest exists AND has the expected version in the module folder's `package.json`. If not, do the next step

   1. In another FE container terminal, run `npm i`. This will tell the FE container to use the latest `package.json` to update its `node_modules` and `package-lock.json`, so now the FE container should have the correct dependencies. **However**, running `npm i` in the FE container has an unwanted side effect of reverting `package-lock.json` to NPM lock version 1, when we want to use version 2. Thus, please make sure to do the next step

   1. **Important**: In yet another terminal, go to your local CZ Gen Epi's FE directory `aspen/src/frontend/` and run `npm i`. This will update `package-lock.json` again to use lock version 2!

   1. At this point, your app should be working without any runtime error. And if you still have problems, please reach out to CZI Slack channels **#org-tech-frontend** and **#help-frontend** for help!
