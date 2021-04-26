import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

test("renders the Homepage", () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to Aspen!/i);
  expect(linkElement).toBeInTheDocument();
});
