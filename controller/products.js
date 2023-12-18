const Products=require('../model/Products')



const addProducts=(req,res)=>{
    res.render("uploadForm")
}

const uploadProducts=(req,res)=>{
res.send("hello")
}




module.exports={
    addProducts,
    uploadProducts
}