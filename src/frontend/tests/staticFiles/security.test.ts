import { readFileSync } from "fs";

const checkExpirationDate = (path) => {
  const text = readFileSync(path).toString();
  const expirationDateStr = text.match(/Expires: .*/g)[0].slice(9);
  const expirationDate = new Date(expirationDateStr);
  const now = new Date();

  if (expirationDate < now) throw Error("security.txt files need updating");
};

test("ensure first security.txt file has not expired", () => {
  expect(() => checkExpirationDate("public/security.txt")).not.toThrow();
});

test("ensure second security.txt file has not expired", () => {
  expect(() =>
    checkExpirationDate("public/.well-known/security.txt")
  ).not.toThrow();
});
