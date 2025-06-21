import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../model/userModel.js";
import Profile from "../model/profileModel.js";
import OTP from "../model/otpModel.js"; // Updated OTP model

// Function to create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Function to send OTP email (numeric OTP now)
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // ignore self-signed cert errors
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Verification",
    html : `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">👋 Hello!</h2>
            <p>Thank you for signing up. Here is your OTP:</p>
            <p style="font-size: 24px; font-weight: bold; background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 6px;">
              ${otp}
            </p>
            <p>This OTP is valid for <strong>3 minutes</strong>. Do not share it with anyone.</p>
            <br/>
            <p style="color: #777;">- SpirocDac Team</p>
          </div>
        </body>
        </html>
      `,
  };

  await transporter.sendMail(mailOptions);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);

      // Ensure profile exists
      let profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        profile = new Profile({ userId: user._id });
        await profile.save();
      }

      res.json({
        success: true,
        token,
        name: user.name,
        email: user.email,
        userId: user._id,
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user registration (sending OTP)
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Generate numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Numeric OTP
    const otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes expiry

    // Save OTP to DB with unique otpId
    const otpRecord = new OTP({
      email,
      otp,
      expiry: otpExpiry,
      name,
      password,
    });
    await otpRecord.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email. Please verify.",
      otpId: otpRecord._id, // Returning OTP ID for verification
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to verify OTP and create user using otpId
// In the verifyOtp route
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, otpId } = req.body;

    console.log("Received otpId from frontend:", otpId);

    // Validate email and otpId
    if (!email || !otp || !otpId) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Find the OTP record by otpId
    const otpRecord = await OTP.findById(otpId);
    console.log("Fetched OTP Record:", otpRecord);
    if (!otpRecord) {
      return res.json({
        success: false,
        message: "OTP not found. Please register again.",
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiry < Date.now()) {
      await OTP.deleteOne({ _id: otpId }); // Clean up expired OTP
      return res.json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Create the user if OTP matches
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(otpRecord.password, salt);

    const newUser = new userModel({
      name: otpRecord.name, 
      email: otpRecord.email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Create profile for the user
    const newProfile = new Profile({ userId: user._id });
    await newProfile.save();

    // Clean up OTP record after successful registration
    await OTP.deleteOne({ _id: otpId });

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      userId: user._id,
      message: "Registration successful",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Resend OTP Route
const resendOtp = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    let otpRecord = await OTP.findOne({ email });

    // Generate new numeric OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Numeric OTP
    const newExpiry = Date.now() + 3 * 60 * 1000;

    if (!otpRecord) {
      otpRecord = new OTP({
        email,
        otp: newOtp,
        expiry: newExpiry,
        name,
        password,
      });

      await otpRecord.save();
      await sendOtpEmail(email, newOtp);

      return res.json({ success: true, message: "New OTP sent successfully", otpId: otpRecord._id });
    }

    // Update existing OTP
    otpRecord.otp = newOtp;
    otpRecord.expiry = newExpiry;
    await otpRecord.save();

    await sendOtpEmail(email, newOtp);

    res.json({ success: true, message: "OTP resent successfully", otpId: otpRecord._id });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

// Route for resetting password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Route to get user profile by userId
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId }).exec();

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Route to update or create user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userid;
    const { phone, branch, age, education, github, linkedin } = req.body;

    let profile = await Profile.findOne({ userId });

    if (profile) {
      profile.phone = phone;
      profile.branch = branch;
      profile.age = age;
      profile.education = education;
      profile.github = github;
      profile.linkedin = linkedin;

      await profile.save();

      return res
        .status(200)
        .json({ message: "Profile updated successfully", profile });
    } else {
      profile = new Profile({
        userId,
        phone,
        branch,
        age,
        education,
        github,
        linkedin,
      });

      await profile.save();

      return res
        .status(201)
        .json({ message: "Profile created successfully", profile });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Route to save purchased courses
// Save purchased courses to DB
// const savePurchasedCourses = async (req, res) => {
//   try {
//     const { userId, courses } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Merge previous courses with new ones (avoid duplicates)
//     const existingCourseIds = user.purchasedCourses || [];
//     const newUniqueCourses = courses.filter(
//       (c) => !existingCourseIds.includes(c._id)
//     );

//     user.purchasedCourses = [...existingCourseIds, ...newUniqueCourses];
//     await user.save();

//     res.status(200).json({ message: "Purchased courses saved successfully", purchasedCourses: user.purchasedCourses });
//   } catch (error) {
//     console.error("Error saving purchased courses:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  //savePurchasedCourses,
};
