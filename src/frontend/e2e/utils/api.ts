const { request, expect } = require("@playwright/test");
import fs from "fs";
const path = require("path");
// import { path } from "lodash/fp";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const storageCookie = "e2e/storage/cookies.json";
export default abstract class ApiUtil {
  /*
    Function for making post requests
    @param {string} endpoint - target endpoint relative to the base url
    @param {object} payload - option payload in JSON formation
    @return {object} return JSON body object
    */
  public static async postRequest(endpoint: string, payload?: object) {
    const response = await request.post(endpoint, {
      data: payload,
      headers: ApiUtil.setHeaders(),
    });
    expect(response.ok()).toBeTruthy();
    return await response.json;
  }

  /*
    Function for making get requests
    @param {string} endpoint - target endpoint relative to the base url
    @return {object} return JSON body object
    */
  public static async getRequest(endpoint: string) {
    const context = await request.newContext({
      baseURL: process.env.BASEAPI,
    });
    await context
      .get(endpoint, {
        headers: {
          Accept: "application/json",
          cookie: process.env.COOKIE,
        },
      })
      .then((response: { ok: () => any; json: () => any }) => {
        console.log("****** been here **********");
        console.log(response);
        expect(response.ok()).toBeTruthy();
        return response.json();
      });
  }

  /*
    Helper function for HTTP request headers. It reads cookie from file and attaches to the header
    @return {object} return header object
    */
  public static setHeaders() {
    return {
      Accept: "application/json",
      Cookie: fs.readFileSync(storageCookie, "utf8"),
    };
  }
}
