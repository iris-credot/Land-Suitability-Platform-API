const LoanAppModel= require('../Models/Activity.js');
const asyncWrapper = require('../Middleware/async.js');
const Badrequest=require('../Error/BadRequest.js');
const Notfound=require('../Error/notFound.js');
const cloudinary =require('cloudinary');
const sendEmail = require('../Middleware/mail.js');
cloudinary.v2.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
  });

const LandApplication ={
    addActivity: asyncWrapper(async (req, res,next) => {
        const { landId,climate, soil, ph,fertility,...otherFields} = req.body;
        if(!req.files || !('image' in req.files)  ){
            return next(new Badrequest(`One or more files are missing`));
        }
          const dateNow = Date.now();
         
          const image = `${landId}_IMAGE_${dateNow}`;
         
          const ImageCloudinary = await cloudinary.v2.uploader.upload(req.files.image[0].path,{
            folder:`LAND`,
            public_id: image
          })
    
            const newLandRequest = new LoanAppModel({
                landId,
                climate,
                 soil,
                  ph,
                  fertility,
                  image:   ImageCloudinary.secure_url,
                  ...otherFields
              
            });
    
      
        await newLandRequest.save();
      
        res.status(201).json({LAND:newLandRequest});
     
      }),
    
getAllLands: asyncWrapper(async (req, res,next) => {
    const lands = await LoanAppModel.find({})
    res.status(200).json({ lands })
  }),

  getLandbyId: asyncWrapper(async (req, res,next) => {
    const { id: landID } = req.params
    const loan = await LoanAppModel.findOne({ _id: landID });
    if (!loan) {
      return next(new Notfound(`Land not found`));
  };
    res.status(200).json({ loan })
  }),
  deleteLoan: asyncWrapper(async (req, res, next) => {
    const { id: landID } = req.params
    const loan = await LoanAppModel.findOneAndDelete({ _id: landID })
   
    res.status(200).json({ loan })
  }),
updateLoan: asyncWrapper(async (req, res,next) => {
    const { id } = req.params;
      const updatedLoan = await LoanAppModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedLoan) {
        return next(new Notfound(`Land not found`));
      }

      res.json(updatedUser);
  }),
  
}
module.exports = LandApplication;