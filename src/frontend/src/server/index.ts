import express from "express";
import csp from "helmet-csp";
import hsts from "hsts";
import path from "path";
import { cspSettings } from "./config/cspSettings";

const buildDir = path.join(process.cwd() + "/build");
const app = express();

const ONE_YEAR_S = 365 * 24 * 60 * 60;

// Middlewares
// NOTE(thuang): `app.use()` injection order matters
app.use(hsts({ maxAge: 2 * ONE_YEAR_S }));
app.use(csp(cspSettings));

app.use(express.static(buildDir));

app.get("/*", function (_, res) {
  res.sendFile(path.join(buildDir, "index.html"));
});

const PORT = 3000;

console.log("checking port...", PORT);

app.listen(PORT, () => {
  console.log(`Server now listening on port: ${PORT}`);
});
