const express=require("express")
const adminRoute=express()
const adminController=require('../controller/adminController')
const middleware=require('../middleware/admin')
const productsController=require('../controller/products')
const multer=require('multer')
const path=require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).array("images", 4);


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


adminRoute.post('/deleteimage/:imgid/:index/:proid',middleware.verify,productsController.imagedelete)




module.exports=adminRoute