// models/Message.js
const mongoose = require('mongoose');


    const LandDetailsSchema = new mongoose.Schema({
        UPI: {
          type: String
        },
        owner: {
          type: String
        },
        size: {
          type: String
        },
        location:{
            type: String
        },
        destiny:{
            type: String
        },
            proofOfLand: {
                type: String
            },
        created_at:{
            type: Date,
            default: Date.now()
        },
    });
        timestamps:{true}
      
      

const LandModel =mongoose.model('LandDetails',LandDetailsSchema);
module.exports = LandModel;
