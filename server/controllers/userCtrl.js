const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const cloudinary = require("cloudinary").v2;
const { v4: uuid } = require("uuid");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const User = require("../model/userModel");
const HttpError = require("../model/errorModel");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    if (password.trim().length < 6) {
      return next(
        new HttpError("Password should be at least 6 charchers", 422)
      );
    }

    if (password !== password2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashedPass,
    });

    res.status(201).json(`New user ${newUser.email} Registred`);
  } catch (error) {
    return next(new HttpError("User Registration failed", 422));
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Fill in all fields", 422));
    }
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Invalid Credentials", 422));
    }

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return next(new HttpError("Invalid Credentails", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login failed. Please check your credentails.", 422)
    );
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 422));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const changeAvatar = async (req, res, next) => {
  try {
    // Check if an avatar file was uploaded
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: "Please choose an image." });
    }

    // Find the user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the user has an existing avatar, delete it from Cloudinary
    if (user.avatar) {
      await cloudinary.uploader.destroy(user.avatar); // Delete the previous avatar from Cloudinary
    }

    const avatarFile = req.files.avatar;
    if (avatarFile.size > 500000) {
      return res.status(422).json({
        message: "Profile picture too big. Should be less than 500kb",
      });
    }

    // Construct temporary file path for local storage
    const tempFilePath = `uploads/${Date.now()}-${avatarFile.name}`;

    // Move the uploaded file to the temporary file path
    await avatarFile.mv(tempFilePath);

    // Upload the temporary file to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath);

    // Cleanup: Delete the temporary file
    fs.unlinkSync(tempFilePath);

    // Update the user's avatar field with the new image URL
    user.avatar = result.secure_url;
    await user.save();

    // Respond with the updated user object
    res.status(200).json({ user, message: "Avatar updated successfully." });
  } catch (error) {
    console.error(error);
    // Handle error
    res.status(500).json({ message: "Error uploading avatar" });
  }
};

const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } =
      req.body;

    if (!name || !email || !currentPassword || !newPassword) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 403));
    }

    const emailExist = await User.findOne({ email });

    if (emailExist && emailExist._id != req.user.id) {
      return next(new HttpError("Email already exist.", 422));
    }

    const validatePassword = await bcrypt.compare(
      currentPassword,
      user?.password
    );
    if (!validatePassword) {
      return next(new HttpError("Invalid current password", 422));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("New Password do not match", 422));
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        password: hash,
      },
      { new: true }
    );

    res.status(200).json(newInfo);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
};
