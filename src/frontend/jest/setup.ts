// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "whatwg-fetch";
import { server } from "../tests/utils/server";

// Source: https://kentcdodds.com/blog/stop-mocking-fetch
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
