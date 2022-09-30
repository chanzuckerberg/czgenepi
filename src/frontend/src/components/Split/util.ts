import ENV from "src/common/constants/ENV";

// Keyword to tell Split client it's running in local-only mode.
const SPLIT_LOCALHOST_ONLY_MODE = "localhost";

export const isLocalSplitEnv = ENV.SPLIT_FRONTEND_KEY === SPLIT_LOCALHOST_ONLY_MODE;

