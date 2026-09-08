import { createAuthClient } from "better-auth/react";
import { serverUrl } from "./environment";
import { nextCookies } from "better-auth/next-js";

export const auth = createAuthClient({
  baseURL: serverUrl,
  basePath: "/api/auth",
  plugins: [nextCookies()],
});

