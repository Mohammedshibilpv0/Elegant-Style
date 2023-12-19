const Products=require('../model/Products')
const Category=require('../model/category')
const multer=require('multer')
const path=require('path')
const express=require('express')
const app=express()



//multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create the Multer instance with the storage configuration
  const upload = multer({ storage: storage }).array('images', 4);
  
  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, 'public')))







const addProducts= async(req,res)=>{
  try{
    const category = await Category.find()
    const errormsg = req.flash("err");
    const admin=req.session.admin
    res.render("addproducts",{category ,errormsg,admin})

  }catch(err){
    console.log(err);
  }
}

const uploadProducts = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        const errorMsg = "Image more than 4 is not allowed";
        req.flash("err", errorMsg);
        res.redirect('/admin/addproduct');
      } else {
        // The files are uploaded successfully
        // Access them in req.files array
        // Example: req.files[0], req.files[1], ...

        const product = new Products({
          Name: req.body.name,
          Price: req.body.price,
          Quantity: req.body.quantity,
          Description: req.body.description,
          Category: req.body.category,
          Date: req.body.date,
          // Use req.files to get the uploaded file information
          Images: req.files.map(file => file.filename),
        });

        await product.save();

        res.redirect('/admin/products'); // Redirect to the products page or wherever you want
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const allProducts= async (req,res)=>{

  const allProducts=await Products.find()
  const admin=req.session.admin
  res.render('allproducts',{allProducts,admin})

}


module.exports={
    addProducts,
    uploadProducts,
    allProducts
}