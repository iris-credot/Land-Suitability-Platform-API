const asyncWrapper = require('../Middleware/async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel= require('../Models/user');
const teacherModel =require('../Models/reseacher')
const otpModel = require ('../Models/otp' ); 
const Badrequest=require('../Error/BadRequest');
const Notfound=require('../Error/notFound');

const UnauthorizedError =require('../Error/unauthorized');
const sendEmail = require('../Middleware/mail');

// const teacherModel = require('../Model/Teacher.model');


const authController ={
    
    getAllusers: asyncWrapper(async (req, res,next) => {
        const users = await userModel.find({})
        res.status(200).json({ users })
      }),
 
    signup_post: asyncWrapper(async (req, res, next) => {
      const foundUser = await userModel.findOne({ email: req.body.email });
      if (foundUser) {
          return next(new Badrequest("Email already in use"));
      };
      const otp = Math.floor(Math.random() * 8000000);
      const otpExpirationDate = new Date(Date.now() + 5 * 60 * 1000); 
      const newUser = new userModel({
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
        const body=`Your OTP is ${otp}`;
        await sendEmail(req.body.email, "Verify your account",body );
      // await sendOtpEmail(req.body.email,res);
        // Ensure this is the only response sent for this request
        res.status(200).json({ user: savedUser, otp: otp });
     
     
    }),
    
    
    OTP: asyncWrapper(async(req,res,next) =>{
    
      const foundUser = await userModel.findOne({ otp: req.body.otp });
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
              message: "User account verified!",
              user: savedUser
          });
      
      }}),

  
    deleteUser: asyncWrapper(async (req, res, next) => {
      const { id: userID } = req.query
      const user = await userModel.findOneAndDelete({ _id: userID })
     
      res.status(200).json({ user })
    }),
    UpdatePassword :asyncWrapper(async (req, res,next) => {
      const { currentPassword, newPassword,confirm } = req.body;
      const userId = req.userId; // Assuming the user ID is retrieved from the authenticated user
  
      
          // Find the user by ID
          const user = await userModel.findById(userId);
          if (!user) {
            return next(new Notfound(`User not found`));
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
          user.password=newPassword;
  
          // Save the updated user object to the database
          await user.save();
  
          console.log('Password updated successfully');
          return res.json({ success: true, message: 'Password updated successfully' });
      
  }),
    
    updateUser: asyncWrapper(async (req, res,next) => {
      const { id } = req.params;
        const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        if (!updatedUser) {
          return next(new Notfound(`User not found`));
        }

        res.json(updatedUser);
      
    }),

 ForgotPassword : asyncWrapper(async (req, res, next) => {
     
      const foundUser = await userModel.findOne({ email: req.body.email });
      if (!foundUser) {
        return next(new Notfound(`Your email is not registered`));
      }

  
      // Generate token
      const token = jwt.sign({ id: foundUser.id }, process.env.SECRET_KEY, { expiresIn: "15m" });
  
      // Recording the token to the database
      await otpModel.create({
          token: token,
          user: foundUser._id,
          expirationDate: new Date().getTime() + (60 * 1000 * 5),
      });
  
      const link = `http://localhost:5003/auth/reset?token=${token}&id=${foundUser.id}`;
      const emailBody = `Click on the link bellow to reset your password\n\n${link}`;
  
      await sendEmail(req.body.email, "Reset your password", emailBody);
  
      res.status(200).json({
          message: "We sent you a reset password link on your email!",
          link:link
         
      });
     
  }),
  ResetPassword: asyncWrapper(async (req, res, next) => {
    const { email, token ,newPassword,confirm} = req.body; // Extract email and token from request body
    console.log('Received email:', email);    
    
    let user = null;
    try {
      user = await teacherModel.findOne({ email });
     
  } catch (error) {
      console.error('Error RESETING as reseacher:', error);
  }

 
  // If not a manager, attempt to login as an admin
  if (!user) {
      try {
          user = await userModel.findOne({ email });
       
      } catch (error) {
          console.error('Error logging in as admin:', error);
      }
  }

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const otpRecord = await otpModel.findOne(req.userId);
    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
console.log(req.body);
    // Check if token is expired
    

    // Check if newPassword and confirm are equal
    if (newPassword !== confirm) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
  }
   
   

    // Hash the new password
    // const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    // Update the user's password
    user.password = newPassword;
    await user.save();

    // Delete the OTP record from the database
    await otpModel.deleteOne({ token });
     
    // Respond with success message
    return res.status(200).json({ message: 'Password reset successfully' });
})
}
module.exports = authController