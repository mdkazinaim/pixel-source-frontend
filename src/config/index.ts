const isProd = process.env.NODE_ENV === "production";

const APP_HOST = process.env.APP_HOST || "http://localhost";
const APP_PORT = process.env.APP_PORT || "3000";
const API_PREFIX = process.env.API_PREFIX || "api/v1";

// Core composition
const API_BASE = isProd
  ? `${APP_HOST}/${API_PREFIX}` // no port in prod (usually)
  : `${APP_HOST}:${APP_PORT}/${API_PREFIX}`;

export const config = {
  isProd,
  APP_HOST,
  APP_PORT,
  API_PREFIX,
  API_BASE,
};
