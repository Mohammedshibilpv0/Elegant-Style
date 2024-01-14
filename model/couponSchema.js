const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  couponName:{
    type:String,
    required:true
  },
  couponCode:{
    type:String,
    required:true,
    unique: true,
  },
  discountPercent:{
    type:Number,
    required:true
  },
    minAmount:{
    type:Number,
    required:true
  },
  couponDescription:{
    type:String,
    required:true
  },
  expiryDate:{
    type:Date,
  },
  status:{
    type:Boolean,
    default:true
  },
  userUsed : [{
       user_id:{
       type : mongoose.Types.ObjectId,
       ref :'User'
       }

    }],
},{timestamps:true})

couponSchema.pre('find', async function () {
  const currentDate = new Date();
  await this.model.updateMany(
      { expiryDate: { $lt: currentDate }, status: true },
      { $set: { status: false } }
  );
});module.exports = mongoose.model('Coupon',couponSchema)