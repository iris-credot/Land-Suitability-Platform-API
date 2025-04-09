const mongoose = require('mongoose');

const userOtpAuthentication = new mongoose.Schema({
   teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
   email: {type:String},
   token: {type:String},
   createdAt: {type:Date},
   expirationDate:{type: Date}
  
  
});


module.exports = mongoose.model('UserOtp', userOtpAuthentication);
 