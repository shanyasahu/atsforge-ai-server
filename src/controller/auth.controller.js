const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
const generateToken = require("../utils/generateToken");
const verifyGoogleToken = require("../services/googleAuth.service");

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in request body
 * @access Public
 */
async function registerUserController(req, res) {
  try {
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

    const token = generateToken(user);

    res.cookie("token", token);

    res.status(201).json({
      message: "User successfully registerd!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

/**
 * @name loginUserController
 * @description login a user, expects email and passowrd in the request body
 * @access Public
 */

async function loginUserController(req, res) {
  try {
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

    const token = generateToken(user);

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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

/**
 * @name logoutUserController
 * @description logout user and delete cookie from user token and add to blacklist
 * @access Public
 */

async function logoutUserController(req, res) {
  try {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

/**
 * @name getMeController
 * @description get the current logged in user details,
 * @access private
 */

async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
      message: "User details fetched successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

// Google OAuth controller for login

// async function googleLoginController(req, res) {
//   const { credential } = req.body;

//   const payload = await verifyGoogleToken(credential);
//   console.log("Google payload:", payload);
//   console.log("Generated JWT:", token);

//   let user = await userModel.findOne({ email: payload.email });

//   if (!user) {
//     user = await userModel.create({
//       username: payload.name,
//       email: payload.email,
//       // avatar: payload.picture,
//     });
//   }

//   const token = generateToken(user);

//   res.cookie("token", token, {
//     httpOnly: true,
//     sameSite: "none",
//     secure: false,
//     path: "/",
//   });

//   res.status(200).json({
//     message: "Google login success",
//   });
// }

async function googleLoginController(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    const payload = await verifyGoogleToken(credential);
    // console.log("Google payload:", payload); // ✅ payload exists here

    let user = await userModel.findOne({ email: payload.email });

    if (!user) {
      user = await userModel.create({
        username: payload.name,
        email: payload.email,
      });
    }

    const token = generateToken(user); // ✅ declared FIRST
    // console.log("Generated JWT:", token); // ✅ logged AFTER declaration

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax", // ✅ lax for localhost HTTP
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Google login success" });
  } catch (err) {
    console.error("Google login error:", err.message); // ✅ you'll see errors now
    return res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  googleLoginController,
};
