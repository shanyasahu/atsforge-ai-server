const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not provided!",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      message: "Invalid token!",
    });
  }

  const isTokenBlackListed = await tokenBlacklistModel.exists({ token });

  if (isTokenBlackListed) {
    return res.status(401).json({
      message: "token is invalid!!!",
    });
  }

  req.user = decoded;
  next();
}

module.exports = { authUser };
