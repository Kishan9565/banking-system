const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
// const emailServices = require('../services/email.service');
const tokenBlacklistModel = require("../models/blackList.model");

async function userRegisterController(req, res) {

      const { email, password, name } = req.body

      const isExists = await userModel.findOne({
            email: email
      })

      if (isExists) {
            return res.status(422).json({
                  message: "User already exists with email.",
                  status: "failed"
            })
      }

      const user = await userModel.create({
            email, password, name
      })

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

      res.cookie("token", token);

      res.status(201).json({
            user: {
                  _id: user._id,
                  email: user.email,
                  name: user.name
            },
            token
      });

      // await emailServices.sendRegistrationEmail(user.email, user.name);
}

async function userLoginController(req, res) {

      const { email, password } = req.body

      const user = await userModel.findOne({ email }).select("+password")

      if (!user) {
            return res.status(401).json({
                  message: "Email or password is Invalid"
            })
      }

      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
            return res.status(401).json({
                  message: "Email or password is Invalid"
            })
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

      res.cookie("token", token);

      res.status(200).json({
            user: {
                  _id: user._id,
                  email: user.email,
                  name: user.name
            },
            token
      })
}

async function userLogoutController(req, res) {
      const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
            return res.status(400).json({
                  message: "No token provided"
            });
      }

      res.clearCookie("token");

      await tokenBlacklistModel.create({
            token: token
      });
      res.status(200).json({
            message: "User logged out successfully"
      })
}

async function userMeController(req, res) {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
            return res.status(401).json({ message: 'No token provided' });
      }

      try {
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.userId).select('+systemUser');
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json({ user: { _id: user._id, email: user.email, name: user.name, systemUser: !!user.systemUser } });
      } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
      }
}

module.exports = {
      userRegisterController,
      userLoginController,
      userLogoutController,
      userMeController
};
