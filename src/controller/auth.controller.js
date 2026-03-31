const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in request body
 * @access Public
 */
async function registerUserController(req, res) {
  const { username, email, password } = req.body; //destructure from req.body

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter the username, email and password!",
    });
  }

  //if username or email already exists

  // $or operator ask the array in which we put the multiple condtions if any one condtion is true return the statement

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    if (isUserAlreadyExists.username == username) {
      return res.status(400).json({
        message: "Account already exists with this username!",
      });
    } else {
      return res.status(400).json({
        message: "Account already exists with this email address!",
      });
    }
  }

  //bcrypt the password using hasing
  const hash = await bcrypt.hash(password, 10);

  //create new user
  const user = await userModel.create({
    username,
    email,
    password: hash,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User successfully registerd!",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name loginUserController
 * @description login a user, expects email and passowrd in the request body
 * @access Public
 */

async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid password",
    });
  }

  // const token = jwt.sign(
  //   { id: user._id, username: user.username },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" },
  // );

  // res.cookie("token", token);

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    message: "User logged in successfully!",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name logoutUserController
 * @description logout user and delete cookie from user token and add to blacklist
 * @access Public
 */

async function logoutUserController(req, res) {
  const token = req.cookies?.token;

  const blacklisted = await tokenBlacklistModel.findOne({ token });

  if (blacklisted) {
    return res.status(401).json({
      message: "Token expired. Please login again.",
    });
  }

  if (token) {
    const saved = await tokenBlacklistModel.create({ token });
  }

  res.clearCookie("token");

  res.status(200).json({
    message: "User logged out successfully",
  });
}

/**
 * @name getMeController
 * @description get the current logged in user details,
 * @access private
 */

async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "User details fetched successfully!",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
