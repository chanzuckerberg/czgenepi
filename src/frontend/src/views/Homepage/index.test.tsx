import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { ReactQueryWrapper } from "../../../tests/utils/helpers";
import Homepage from "./index";

test("renders the Homepage", async () => {
  render(
    <ReactQueryWrapper>
      <Homepage />
    </ReactQueryWrapper>
  );

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Welcome to Aspen/)).toBeInTheDocument();
  });
});
