const asyncWrapper = require('../Middleware/async');
const teachersNew = require('../Models/landDetails');
const Badrequest=require('../Error/BadRequest');
const Notfound=require('../Error/notFound');
const UnauthorizedError =require('../Error/unauthorized');
const CircularJSON = require('circular-json');



const LandDetails=  {

    getAllLandDetails: asyncWrapper(async (req, res,next) => {     
        const teachers = await teachersNew.find().lean(); // Use lean() to get plain JavaScript objects
        res.json({ success: true, teachers });
        }),
      // Get a single contact by ID
      getLandOneDetail: asyncWrapper(async (req, res,next) => {
        const { id } = req.params;
          const teacher = await teachersNew.findById(id);
          if (!teacher) {
            return next(new Notfound(`Land not found`));
          }
          res.json(teacher);
      }),
      getLandbyUPI: asyncWrapper(async (req, res,next) => {
        const { UPI: UPI } = req.query
        const teacher= await teachersNew.findOne({ UPI: UPI });
        if (!teacher) {
          return next(new Notfound(`Land not found`));
        }
  
        res.status(200).json({ teacher })
      }),
     
   
      // Create a new contact
      AddlandDetail: asyncWrapper(async (req, res,next) => {
        const newteacher = new teachersNew(req.body);
          const savedteacher = await newteacher.save();
          res.status(201).json(savedteacher);
      }),
      deleteLand: asyncWrapper(async (req, res,next) => {
        const { id } = req.params;
          const deletedteacher = await teachersNew.findByIdAndDelete(id);
          if (!deletedteacher) {
            return next(new Notfound(`Land not found`));
          }
          res.json({ message: 'Land deleted successfully' });
      }),
      updateLand: asyncWrapper(async (req, res,next) => {
        const { id } = req.params;
          const updatedteacher = await teachersNew.findByIdAndUpdate(id, req.body, {
            new: true,
          });
          if (!updatedteacher) {
            return next(new Notfound(`Land not found`));
          }
          res.json(updatedteacher);
      })
    
};
  
  module.exports = LandDetails;