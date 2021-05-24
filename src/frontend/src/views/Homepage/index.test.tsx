import { render, screen } from "@testing-library/react";
import React from "react";
import Homepage from "./index";

test("renders the Homepage", () => {
  render(<Homepage />);

  const linkElement = screen.getByText(/Welcome to Aspen/i);

  expect(linkElement).toBeInTheDocument();
});
