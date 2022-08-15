import { render, screen } from "@testing-library/react";
import { noop } from "lodash";
import React from "react";
import { Provider } from "react-redux";
import { store } from "src/common/redux";
import { ReactQueryWrapper } from "jest/utils/helpers";
import { CreateNSTreeModal } from "./index";

test("shows NS and GISAID attribution", async () => {
  await render(
    <Provider store={store}>
      <ReactQueryWrapper>
        <CreateNSTreeModal
          checkedSampleIds={[]}
          failedSampleIds={[]}
          open
          onClose={noop}
        />
      </ReactQueryWrapper>
    </Provider>
  );

  // attribution text
  expect(screen.getByText(/Built in partnership with/g)).toBeInTheDocument();

  // indicates image loaded in component (gisaid logo)
  expect(screen.getByText(/next.js image stub/g)).toBeInTheDocument();

  // indicates svg loaded in component (nextstrain logo)
  expect(screen.getByText(/svg stub/g)).toBeInTheDocument();
});
