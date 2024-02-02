const express=require("express")
const adminRoute=express()
const adminController=require('../controller/adminController')
const middleware=require('../middleware/admin')
const productsController=require('../controller/products')
const multer=require('multer')
const path=require('path')
const Order=require('../model/orderSchema')

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads'); // Set your desired upload directory
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
// Route to handle adding a new image to a product
adminRoute.post('/addImage', upload.single('image'), async (req, res) => {
  try {
      const productId = req.body.productId; // Assuming you're passing the productId in the request body

      // Find the product by ID
      const product = await Products.findById(productId);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }

      // Add the new image to the product's Images array
      if (req.file) {
          product.Images.push(req.file.filename);
      } else {
          return res.status(400).json({ error: 'No image file provided' });
      }

      // Save the updated product
      await product.save();

      // Optionally, send a success response
      res.json({ success: true, message: 'Image added to the product successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


const Products = require("../model/Products")


adminRoute.set('views','./views/admin')

adminRoute.get('/',middleware.verify,adminController.home)
adminRoute.get('/login',middleware.isLogin,adminController.login)
adminRoute.get('/allusers',middleware.verify,adminController.allUsers)
adminRoute.post('/login',middleware.isLogin,adminController.verifyAdmin)
adminRoute.get('/logout',middleware.verify,adminController.logout)
adminRoute.post('/unblockuser/:id',middleware.verify,adminController.unblockUser)
adminRoute.post('/blockuser/:id',middleware.verify,adminController.blockUser)
adminRoute.get('/category',middleware.verify,adminController.category)
adminRoute.get('/addcategory',middleware.verify,adminController.addCategory)
adminRoute.post('/addcategory',middleware.verify,adminController.submitCategory)
adminRoute.post('/unlistcategory/:id',middleware.verify,adminController.unlistCategory)
adminRoute.post('/listcategory/:id',middleware.verify,adminController.listCategory)
adminRoute.get('/editcategory/:id',middleware.verify,adminController.editcategory)
adminRoute.post('/editcategorypost/:id',middleware.verify,adminController.submiteditcategory)
//product controller
adminRoute.get('/addproducts',middleware.verify,productsController.addProducts)
adminRoute.post('/products/upload',middleware.verify,productsController.uploadProducts)
adminRoute.get('/products',middleware.verify,productsController.allProducts)
adminRoute.get('/editproduct/:id',middleware.verify,productsController.editProduct)
adminRoute.post('/submitedit/:id',middleware.verify,productsController.submitedit)

adminRoute.post('/unlistproduct/:id',middleware.verify,productsController.unlistProduct)
adminRoute.post('/listproduct/:id',middleware.verify,productsController.listProduct)
adminRoute.get('/allorders',adminController.allorders)

adminRoute.post('/deleteimage/:imgid/:index/:proid',middleware.verify,productsController.imagedelete)
adminRoute.put('/updateStatus/:orderId',adminController.changestatus)
adminRoute.get('/coupon',adminController.coupon)
adminRoute.get('/addcoupon',adminController.addcoupon)
adminRoute.post('/addCouponsubmit',adminController.postaddcoupon)
adminRoute.delete('/deleteCoupon/:id',adminController.deleteCoupon)
adminRoute.get('/salesreport',adminController.saleReport)




module.exports=adminRoute