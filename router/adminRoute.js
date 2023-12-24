const express=require("express")
const adminRoute=express()
const adminController=require('../controller/adminController')
const middleware=require('../middleware/admin')
const productsController=require('../controller/products')
const products=require('../model/Products')
const multer=require('multer')
const path=require('path')

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

//product controller
adminRoute.get('/addproducts',productsController.addProducts)
adminRoute.post('/products/upload',productsController.uploadProducts)
adminRoute.get('/products',productsController.allProducts)
adminRoute.get('/editproduct/:id',productsController.editProduct)
adminRoute.post('/submitedit/:id',productsController.submitedit)

adminRoute.post('/unlistproduct/:id',productsController.unlistProduct)
adminRoute.post('/listproduct/:id',productsController.listProduct)


module.exports=adminRoute