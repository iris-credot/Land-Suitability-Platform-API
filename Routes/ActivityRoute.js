const express = require('express');
const activityrouter= express.Router();
const auth = require('../Middleware/authentication');
const authController = require('../controllers/activityController');


activityrouter.post('/add', auth.adminJWT,authController.addActivity);
activityrouter.get('/getall',auth.AuthJWT,authController.getAllLands);
activityrouter.get('/getOne/:id', auth.AuthJWT,authController.getLandbyId);
activityrouter.delete('/delete/:id',auth.adminJWT,authController.deleteLoan);
activityrouter.put('/getOne/:id', auth.adminJWT,authController.updateLoan);


module.exports = activityrouter;