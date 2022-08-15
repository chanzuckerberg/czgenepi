// Source: https://kentcdodds.com/blog/stop-mocking-fetch
// this is put into here so I can share these same handlers between my tests
// as well as my development in the browser. Pretty sweet!

import { rest } from "msw";
import { API } from "../../src/common/api";
import ENV from "../../src/common/constants/ENV";
import { userInfo } from "../fixtures/userInfo";

export const handlers = [
  rest.get(ENV.API_URL + API.USERDATA, (req, res, context) => {
    if (!req.cookies.session) {
      return res(
        context.status(401),
        context.json({ message: "Not authorized" })
      );
    }

    return res(context.status(200), context.json(userInfo));
  }),
];