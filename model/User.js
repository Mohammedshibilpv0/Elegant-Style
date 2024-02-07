
const mongoose=require('mongoose')

const userData= new mongoose.Schema({

    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        
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
    wallet:{
      type:Number,
      default: 0
  },
  Referid:{
    type:Number,
    required:true
  },
  
  walletHistory:[{
      amount: {
          type: Number,

      },

      description: {
          type: String,

      },
      date: {
          type: Date,
          default:Date.now()

      }
      ,
      status: {
          type: String,

      }

  }],

    Addresses: [
        {
          location: {
            type: String,
          },
          address: {
            type: String,
          },
          city: {
            type: String,
          },
          zip: {
            type: String,
          },
          phone:
          {
            type: String,
          },
          email: {
            type: String,
          },
          state: {
            type: String,
          },
        },
      ],

})

const User=mongoose.model("User",userData)

module.exports=User