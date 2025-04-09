const express = require('express');
const userrouter= express.Router();
const validate= require('../Middleware/validation');
const auth = require('../Middleware/authentication');
const authController = require('../controllers/usercontroller');
const login = require('../controllers/loginController');


userrouter.post('/signup',validate,authController.signup_post);
userrouter.post('/login', login.login_post);
userrouter.post('/forgot', authController.ForgotPassword);
userrouter.post('/verifyotp', authController.OTP);
userrouter.post('/resetpassword/:token', authController.ResetPassword);
userrouter.post('/logout', login.logout);
userrouter.get('/all' ,auth.adminJWT,authController.getAllusers);
userrouter.delete('/delete/:id',auth.adminJWT, authController.deleteUser);
userrouter.put('/put/:id', auth.adminJWT,authController.updateUser);
userrouter.put('/update/:id', auth.adminJWT,authController.UpdatePassword);

module.exports = userrouter;