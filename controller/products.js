const Products = require("../model/Products");
const Category = require("../model/category");
const Cart=require('../model/cartSchema')
const multer = require("multer");
const path = require("path");
const express = require("express");
const app = express();
const fs = require('fs');
const offerSchema=require('../model/offerSchema')

//multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create the Multer instance with the storage configuration
const upload = multer({ storage: storage }).array("images", 4);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

const addProducts = async (req, res) => {
  try {
    const category = await Category.find();
    const errormsg = req.flash("err"); //page for addproduct
    const admin = req.session.admin;
    res.render("addproducts", { category, errormsg, admin });
  } catch (err) {
    console.log(err);
  }
};

const uploadProducts = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        const errorMsg = "Image more than 4 is not allowed";
        req.flash("err", errorMsg);
        return res.redirect("/admin/addproducts");
      }

      const alreadyProduct = await Products.findOne({ Name: req.body.name });

      if (alreadyProduct) {
        const errorMsg = "Product already added";
        req.flash("err", errorMsg);
        return res.redirect("/admin/addproducts");
      }




      const product = new Products({
        Name: req.body.name,
        Price: req.body.price,
        Quantity: req.body.quantity,
        Description: req.body.description,
        Category: req.body.category,
        Date: req.body.date,
        Images: req.files.map((file) => file.filename),

      });

      await product.save();

      res.redirect("/admin/products");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// const allProducts = async (req, res) => {
//   //rendring page all products
//   try {
//     const allProducts = await Products.find();
//     const admin = req.session.admin;
//     res.render("allproducts", { allProducts, admin });
//   } catch (err) {
//     console.log(err);
//   }
// };

const allProducts = async (req, res) => {
  try {
      const admin = req.session.admin;
      const perPage = 6;
      const page = parseInt(req.query.page) || 1;
      const offer = await offerSchema.find()
      const totalProducts = await Products.countDocuments();
      const totalPages = Math.ceil(totalProducts / perPage);

      const allProducts = await Products.find()
          .populate('offer')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();

      res.render('allproducts', { allProducts, admin, totalPages, currentPage: page,offer });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
};


const editProduct = async (req, res) => {
  try {
    const admin = req.session.admin;
    const category = await Category.find();
    const products = await Products.findOne({ _id: req.params.id });
    res.render("dummy", { admin, category, products });
  } catch (err) {
    console.log(err);
  }
};

const submitedit = async (req, res) => {
  try{
    upload(req, res, async function (err) {
      if (err) {
        const errorMsg = "Image more than 4 is not allowed";
        req.flash("err", errorMsg);
        res.redirect("/admin/addproducts");
      } else {


    const productId = req.params.id;
    const updatedData = {
      Name: req.body.name,
      Description: req.body.description,
      Quantity: req.body.quantity,
      Price: req.body.price,
      Category:req.body.category,
   
    };
    
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] == "" && delete updatedData[key]
    );
    // Find and update the product
    // const product = await Product.findByIdAndUpdate(productId, updatedData);
    const product = await Products.updateOne({ _id: productId }, updatedData);
    if (product) {
      // Redirect to the product list page
      res.redirect("/admin/products");
    }
    }
  })
  }catch(err){
    console.log(err);
  }
}

const singleProduct = async (req, res) => {
  try{

    const userid= req.session.user_id
    const product_id = req.params.id;
    const products = await Products.findOne({ _id: product_id }).populate('Category').populate('offer').exec();
    const recommend = await Products.find({ Category: products.Category }).limit(4).exec();
    const cartcheck= await Cart.findOne({userid:userid})
    if(cartcheck){
      const existsProduct =  cartcheck.products.find((pro) => pro.productId.toString() === product_id);
      if(existsProduct){
        let already=true
      return  res.render("eachproducts", {products,recommend,userid,already});
      }

    }
      res.render("eachproducts", {products,recommend,userid,already:false});

  }catch(err){
    console.log(err);
  }

};

const unlistProduct=async (req,res)=>{
  try{
    const product= await Products.findByIdAndUpdate({_id:req.params.id},{Status:"blocked"})
    const updated= await Products.findOne({_id:req.params.id})
    const status=updated.Status
    res.json({status:status})
  }catch(err){
    console.log(err);
  }
}

const listProduct= async (req,res)=>{
  try{
    const product= await Products.findByIdAndUpdate({_id:req.params.id},{Status:"active"})
    const updated= await Products.findOne({_id:req.params.id})
    const status=updated.Status
    res.json({status:status})
  }catch(err){
    console.log(err);
  }
}




const imagedelete = async (req, res) => {
  try {

  const imgid = req.params.imgid;
  const index = req.params.index;
  const productid = req.params.proid;
  const imagePath = path.join('public', 'uploads', imgid);


    // Fetch the product document
    const product = await Products.findOne({ _id: productid });

    if (!product) {
      console.error('Product not found:', productid);
      return res.status(404).send('Product not found');
    }

    // Check if there is only one image remaining
    if (product.Images.length <= 1) {
      console.error('Cannot delete the last image.');
      return res.status(400).send('Cannot delete the last image.');
    }

    // Delete the image file asynchronously
    await fs.promises.unlink(imagePath);

    // Remove the image reference from the database
    product.Images.splice(index, 1);

    // Save the updated product document
    await product.save();

    res.status(200).send('Image deleted successfully');
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).send('Internal Server Error');
  }
};









module.exports = {
  addProducts,
  uploadProducts,
  allProducts,
  editProduct,
  submitedit,
  singleProduct,
  unlistProduct,
  listProduct,
  imagedelete,

};

