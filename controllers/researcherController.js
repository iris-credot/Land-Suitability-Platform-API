const asyncWrapper = require('../Middleware/async');
const teacherModel = require('../Models/reseacher');
const ManagerModel = require('../Models/landOwner');
const AdminModel= require('../Models/user');
const otpModel = require('../Models/otp');
const jwt = require('jsonwebtoken');

const Badrequest = require('../Error/BadRequest');
const Notfound = require('../Error/notFound');
const bcrypt = require('bcrypt');
const UnauthorizedError = require('../Error/unauthorized');
const sendEmail = require('../Middleware/mail');





const ResearcherController= {

  getAllreseachers: asyncWrapper(async (req, res, next) => {
    const users = await teacherModel.find({})
    res.status(200).json({ users })
  }),
  getreseachersbyId: asyncWrapper(async (req, res, next) => {
    const { id: userID } = req.params
    const user = await teacherModel.findOne({ _id: userID });
    if (!user) {
      return next(new Notfound(`reseachers not found`));
    };
    res.status(200).json({ user })
  }),

  signup_post: asyncWrapper(async (req, res, next) => {
    // const{username,name,role,profile,email,password, last_login ,otpExpires}=req.body;
    console.log(req.body);
    const foundUser = await teacherModel.findOne({ email: req.body.email });
    if (foundUser) {
      return next(new Badrequest("Email already in use"));
    };
    const otp = Math.floor(Math.random() * 8000000);
    const otpExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    const newUser = new teacherModel({
      username:req.body.username,
      names:req.body.names,
      role:req.body.role,
      profile:req.body.profile,
      email:req.body.email,
      password:req.body.password,
      otp: otp,
      otpExpires: otpExpirationDate,
    });

    const savedUser = await newUser.save();
    const body = `Your OTP is ${otp}`;
    await sendEmail(req.body.email, "Verify your account", body);
    // await sendOtpEmail(req.body.email,res);
    // Ensure this is the only response sent for this request
    res.status(200).json({ user: savedUser, otp: otp });


  }),


  OTP: asyncWrapper(async (req, res, next) => {

    const foundUser = await teacherModel.findOne({ otp: req.body.otp });
    if (!foundUser) {
      next(new UnauthorizedError('Authorization denied'));
    };

    // Checking if the otp is expired or not.
    console.log('otpExpires:', new Date(foundUser.otpExpires));
    console.log('Current time:', new Date());
    if (foundUser.otpExpires < new Date().getTime()) {
      next(new UnauthorizedError('OTP expired'));
    }

    // Updating the user to verified
    foundUser.verified = true;
    const savedUser = await foundUser.save();

    if (savedUser) {
      return res.status(201).json({
        message: "reseachers account verified!",
        user: savedUser
      });

    }
  }),


  deleteUser: asyncWrapper(async (req, res, next) => {
    const { id: userID } = req.params
    const user = await teacherModel.findOneAndDelete({ _id: userID })

    res.status(200).json({ user })
  }),
  UpdatePassword: asyncWrapper(async (req, res, next) => {
    const { currentPassword, newPassword, confirm } = req.body;
    const userId = req.userId; // Assuming the user ID is retrieved from the authenticated user


    // Find the user by ID
    const user = await teacherModel.findById(userId);
    if (!user) {
      return next(new Notfound(`reseacher not found`));
    }

    // Check if the current password matches the password stored in the database
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      console.log('Incorrect current password provided');
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    // Check if newPassword and confirm are equal
    if (newPassword !== confirm) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    user.password = newPassword;

    // Save the updated user object to the database
    await user.save();

    console.log('Password updated successfully');
    return res.json({ success: true, message: 'Password updated successfully' });

  }),
  getuserbynames: asyncWrapper(async (req, res, next) => {
    const { names: names } = req.query
    const user = await teacherModel.findOne({ names: names });
    if (!user) {
      return next(new Notfound(`name not found`));
    }

    res.status(200).json({ user })
  }),
  getuserbyUsername: asyncWrapper(async (req, res, next) => {
    const { username: username } = req.query
    const user = await teacherModel.findOne({ username: username });
    if (!user) {
      return next(new Notfound(`Username not found`));
    }

    res.status(200).json({ user })
  }),
  updateUser: asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const updatedUser = await teacherModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return next(new Notfound(`User not found`));
    }

    res.json(updatedUser);

  }),

  ForgotPassword: asyncWrapper(async (req, res, next) => {

    const foundUser = await teacherModel.findOne({ email: req.body.email });
    if (!foundUser) {
      return next(new Notfound(`Your email is not registered`));
    }
    const expiryDate = 15 * 60 * 1000;

    const secret = process.env.SECRET_KEY;
    // Generate token
    const token = jwt.sign({ id: foundUser.id }, secret, { expiresIn: expiryDate });

    // Recording the token to the database
    // await otpModel.create({
    //     token: token,
    //     user: foundUser._id,
    //     expirationDate: new Date().getTime() + (60 * 1000 * 5),
    // });

    const link = `http://localhost:5003/auth/reset?token=${token}&id=${foundUser.id}`;
    const emailBody = `Click on the link bellow to reset your password\n\n${link}`;

    await sendEmail(req.body.email, "Reset your password", emailBody);

    res.status(200).json({
      message: "We sent you a reset password link on your email!",
      link:link
    });
  }),
  ResetPassword: asyncWrapper(async (req, res, next) => {
    const { email, token, newPassword, confirm } = req.body; // Extract email and token from request body
    // const { token } = req.params;
    console.log('Received email:', email);
    // Verify token

    var user = {};

    const fetchedTeacher = await teacherModel.findOne({ email });
    if (fetchedTeacher) {
      user = fetchedTeacher;
    } else if (!fetchedTeacher) {
      const fetchedManager = await ManagerModel.findOne({ email });
      user = fetchedManager;
    } else if (!fetchedTeacher && !fetchedManager) {
      const fetchedAdmin = await AdminModel.findOne({ email });
      user = fetchedAdmin;
    }


    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const otpRecord = await otpModel.findOne(req.userId);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    console.log(req.body);
    // Check if token is expired
    const currentTime = new Date();
    const tokenAge = currentTime - new Date(otpRecord.createdAt);
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000;


    // Check if newPassword and confirm are equal
    if (newPassword !== confirm) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    user.password = newPassword;
    await user.save();
    await otpModel.deleteOne({ email, token });
    return res.status(200).json({ message: 'Password reset successfully' });
  })

}
module.exports = ResearcherController