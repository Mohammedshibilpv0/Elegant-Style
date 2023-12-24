const mongoose=require('mongoose')
const Schema=mongoose.Schema

const verifySchema=new Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date
})

const otpVerify=mongoose.model("UserOtpVerification",verifySchema)

module.exports=otpVerify