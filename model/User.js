
const mongoose=require('mongoose')

const userData= new mongoose.Schema({

    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique: true
    },
    Password:{
        type:String,
        required:true
    },
    JoinDate:{
            type:Date,
            default:Date.now
    },
    Status:{
        type:String,
        enum: ["active", "blocked"],
        default: "active",
    },
    Verified:{
        type: Boolean,
        default: false

    },

})

const User=mongoose.model("User",userData)

module.exports=User