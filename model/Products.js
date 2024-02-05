const mongoose=require('mongoose')

const ProductSchema= new mongoose.Schema({

    Name:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        min:0,
        required:true,

    },
    Category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Categories',
    },
    Status:{
        type:String,
        enum:["active","blocked"],
        default:"active"
    },
    Quantity:{
        type:Number,
        min:0,
        required:true
    },
    Images:{
        type:[String],
        required:true
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"offer"
      },


})

const Products= mongoose.model("Products",ProductSchema)
module.exports=Products