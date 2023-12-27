const mongoose=require('mongoose')

const category= new mongoose.Schema({

    Name:{
        type:String,
        unique:true,      //for ensure that unique name in category
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Status:{
        type:String,
        enum:["active","blocked"],
        default:"active"              // set default active
    }

})

const Category= mongoose.model("Categories",category)

module.exports=Category