const express = require('express');
const Researcherrouter= express.Router();
const validate= require('../Middleware/validation');
const auth = require('../Middleware/authentication');
const authController = require('../controllers/researcherController');
//const checkTeacherData=require('../Middleware/verifyCredentia');
const login = require('../controllers/loginController');

Researcherrouter.post('/signup', validate,authController.signup_post);
Researcherrouter.post('/login', login.login_post);
Researcherrouter.post('/forgot', authController.ForgotPassword);
Researcherrouter.post('/verifyotp', authController.OTP);
Researcherrouter.post('/logout', login.logout);
Researcherrouter.get('/all' ,auth.BothJWT,authController.getAllreseachers);
Researcherrouter.get('/getOne/:id', auth.BothJWT,authController.getreseachersbyId);
Researcherrouter.get('/findByusername', auth.BothJWT,authController.getuserbyUsername);
Researcherrouter.get('/findBynames',auth.BothJWT, authController.getuserbynames);
Researcherrouter.delete('/delete/:id',auth.BothJWT, authController.deleteUser);
Researcherrouter.put('/put/:id', auth.AuthJWT,authController.updateUser);
Researcherrouter.put('/update/:id', auth.AuthJWT,authController.UpdatePassword);

module.exports = Researcherrouter;