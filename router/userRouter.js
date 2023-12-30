const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
const middleware=require("../middleware/User")
const productsController=require('../controller/products')
const { route } = require("./adminRoute")
const cartController=require('../controller/cartController')





//user login signup otp
router.get('/',middleware.isBlock,userController.home)
router.get('/login',middleware.islogin,userController.login)
router.get('/signup',middleware.islogin,userController.signup)
router.post('/register',middleware.islogin,userController.register)
router.post('/loginsubmit',middleware.islogin,userController.submitlogin)
router.get('/otp',userController.loadOtp);
router.post('/otp',userController.verifyOtp);


router.get('/logout',userController.logout)


//products setting
router.get('/singleproduct/:id',productsController.singleProduct)
router.get('/allproducts',userController.allproducts)


///cart  handlng
router.get('/usercart',cartController.cart)
router.post('/addingcart/:productid/:userid/:quantity',cartController.addtocart)
router.get('/usercheckout',cartController.checkout)


module.exports=router