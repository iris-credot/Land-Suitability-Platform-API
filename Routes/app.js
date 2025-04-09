const researcherRoute = require('./researcherRoute.js');
const userRoute = require('./userRoutes.js');
const landOwnerRoute = require('./landOwnerRoute.js');
const landDetailRoute = require('./landDetailsRoute.js');
const activityroute = require('./ActivityRoute.js');

const express = require('express');

const Router= express.Router();
Router.use('/landOwner',landOwnerRoute);
Router.use('/reseacher',researcherRoute);
Router.use('/user',userRoute);
Router.use('/landDetails',landDetailRoute);
Router.use('/activity',activityroute);


module.exports = Router;