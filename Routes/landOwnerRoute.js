const express = require('express');
const landOwnerrouter= express.Router();
const validate= require('../Middleware/validation');
const auth = require('../Middleware/authentication');
const authController = require('../controllers/landowner');
const login = require('../controllers/loginController');

landOwnerrouter.post('/signup',validate, auth.landOwnerJWT,authController.signup_post);
landOwnerrouter.post('/login', login.login_post);
landOwnerrouter.post('/forgot', authController.ForgotPassword);
landOwnerrouter.post('/verifyotp', authController.OTP);
landOwnerrouter.post('/logout', login.logout);
landOwnerrouter.get('/all' ,auth.adminJWT,authController.getAllLandOwners);
landOwnerrouter.get('/getOne/:id', auth.adminJWT,authController.getLandOwnersbyId);
landOwnerrouter.delete('/delete/:id',auth.adminJWT, authController.deleteUser);
landOwnerrouter.put('/put/:id', auth.BothJWT,authController.updateUser);
landOwnerrouter.put('/update/:id', auth.landOwnerJWT,authController.UpdatePassword);

module.exports =  landOwnerrouter;