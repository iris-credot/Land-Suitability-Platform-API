const express = require('express');
const landDetailsrouter= express.Router();
const auth = require('../Middleware/authentication');
const authController = require('../controllers/landDetailsController');


landDetailsrouter.post('/add', auth.BothJWT,authController.AddlandDetail);
landDetailsrouter.get('/getall',auth.AuthJWT,authController.getAllLandDetails);
landDetailsrouter.get('/getOne/:id', auth.AuthJWT,authController.getLandOneDetail);
landDetailsrouter.delete('/delete/:id',auth.BothJWT,authController.deleteLand);
landDetailsrouter.get('/getByUPI',auth.AuthJWT,authController.getLandbyUPI);
landDetailsrouter.put('/getOne/:id', auth.BothJWT,authController.updateLand);


module.exports = landDetailsrouter;