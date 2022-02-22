// (thuang): Every value needs a default, otherwise Next.js will not compile
module.exports = {
  API_URL: process.env.API_URL || "http://backend.genepinet.localdev:3000",
  BUILD_PATH: process.env.BUILD_PATH || "build",
  COMMIT_SHA: process.env.COMMIT_SHA || "unknown",
  DEPLOYMENT_STAGE: process.env.DEPLOYMENT_STAGE || "development",
  E2E_PASSWORD: process.env.E2E_PASSWORD || "pwd",
  E2E_USERNAME: process.env.E2E_USERNAME || "User1",
  FRONTEND_URL:
    process.env.FRONTEND_URL || "http://frontend.genepinet.localdev:8000",
  HEADFUL: process.env.HEADFUL || false,
  HEADLESS: process.env.HEADLESS || true,
  NODE_ENV: process.env.NODE_ENV || "development",
  SPLIT_FRONTEND_KEY: process.env.SPLIT_FRONTEND_KEY || "localhost",
};
