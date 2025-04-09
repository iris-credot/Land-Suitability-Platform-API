const { required, date } = require('joi');
const mongoose = require('mongoose');
const ActivitySchema = new mongoose.Schema({
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LandDetails'
      },
    climate:{
        type: String
    },
    soil:{
        type:String,
        enum:['clay','sand','roam']
    },
    ph:{
        type:String
    },
   fertility:{
        type:String
        
    },

    moisture: {
        type: String
    },
    image:{
      type:String
    },
    requestedAt: {
        type:Date,
        default: Date.now
      }
});

    const ActivityAppModel = mongoose.model('LandActivity',ActivitySchema);
module.exports = ActivityAppModel;
