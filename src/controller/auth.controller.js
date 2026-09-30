const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const tokenBlacklistModel = require("../models/blacklist.model");
const generateToken = require("../utils/generateToken");
const verifyGoogleToken = require("../services/googleAuth.service");
const { cookieOptions, clearCookieOptions } = require("../utils/cookieOptions");

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    plan: user.plan,
    avatarUrl: user.avatarUrl || "",
    avatarVersion: user.updatedAt ? new Date(user.updatedAt).getTime() : 0,
    authProvider: user.authProvider || "local",
  };
}

async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the username, email and password!",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email: String(email).toLowerCase() }],
    });

    if (isUserAlreadyExists) {
      if (isUserAlreadyExists.username == username) {
        return res.status(400).json({
          message: "Account already exists with this username!",
        });
      }
      return res.status(400).json({
        message: "Account already exists with this email address!",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email: String(email).toLowerCase(),
      password: hash,
      authProvider: "local",
    });

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "User successfully registerd!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel
      .findOne({ email: String(email || "").toLowerCase() })
      .select("+password");

    if (!user || !user.password) {
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
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "User logged in successfully!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

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
      await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token", clearCookieOptions);

    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getMeController(req, res) {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("username email plan avatarUrl updatedAt authProvider")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function googleLoginController(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    const payload = await verifyGoogleToken(credential);

    let user = await userModel.findOne({ email: payload.email });

    if (!user) {
      user = await userModel.create({
        username: payload.name || payload.email.split("@")[0],
        email: payload.email,
        authProvider: "google",
        avatarUrl: payload.picture || "",
      });
    } else if (payload.picture && user.avatarUrl !== payload.picture) {
      user.avatarUrl = payload.picture;
      await user.save();
    }

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "Google login success",
      user: formatUser(user),
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    return res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
}

async function updateProfileController(req, res) {
  try {
    const { username, avatarUrl } = req.body;
    const updates = {};

    if (username !== undefined) {
      const trimmed = String(username).trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Username cannot be empty." });
      }
      const taken = await userModel.findOne({
        username: trimmed,
        _id: { $ne: req.user.id },
      });
      if (taken) {
        return res.status(400).json({ message: "Username already taken." });
      }
      updates.username = trimmed;
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = String(avatarUrl).trim();
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile." });
  }
}

function deleteLocalAvatar(avatarUrl) {
  if (!avatarUrl || !avatarUrl.startsWith("/uploads/avatars/")) return;
  const filePath = path.join(__dirname, "../..", avatarUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function uploadAvatarController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar image is required." });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    deleteLocalAvatar(user.avatarUrl);

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.status(200).json({
      message: "Avatar uploaded.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload avatar." });
  }
}

async function removeAvatarController(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    deleteLocalAvatar(user.avatarUrl);
    user.avatarUrl = "";
    await user.save();

    res.status(200).json({
      message: "Avatar removed.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove avatar." });
  }
}

async function changePasswordController(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await userModel.findById(req.user.id).select("+password");

    if (!user || user.authProvider === "google" || !user.password) {
      return res.status(400).json({
        message: "Password change is not available for this account.",
      });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to change password." });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  googleLoginController,
  updateProfileController,
  changePasswordController,
  uploadAvatarController,
  removeAvatarController,
};
