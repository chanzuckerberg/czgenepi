import { readFileSync } from "fs";

const checkExpirationDate = (path: string) => {
  const text = readFileSync(path).toString();
  const expirationDateStr = text?.match(/Expires: .*/g)?.[0]?.slice(9);

  if (!expirationDateStr) throw Error("security.txt missing expiry date");

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

test("ensure security files in sync", () => {
  const file = readFileSync("public/security.txt").toString();
  const file2 = readFileSync("public/.well-known/security.txt").toString();

  expect(file == file2).toBeTruthy();
});
