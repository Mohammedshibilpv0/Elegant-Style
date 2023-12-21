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
    OfferPrice:{
        type:Number,
        min:0,
        required:true
    },
    Category:{
        type:mongoose.Schema.ObjectId,
        ref:"Categories"
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
    Date:{
        type:Date,
        required:true
    },
    Images:{
        type:[String],
        required:true
    }

})

const Products= mongoose.model("Products",ProductSchema)
module.exports=Products