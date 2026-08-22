const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd || process.env.COOKIE_SECURE === "true",
  sameSite: isProd || process.env.COOKIE_SECURE === "true" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: cookieOptions.secure,
  sameSite: cookieOptions.sameSite,
  path: "/",
};

module.exports = { cookieOptions, clearCookieOptions };
