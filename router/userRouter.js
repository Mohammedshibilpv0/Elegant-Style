const express=require("express")
const route=express()
const router=express.Router()
const userController=require("../controller/userController")
const middleware=require("../middleware/User")
const productsController=require('../controller/products')
const cartController=require('../controller/cartController')
const orderController= require('../controller/orderController')
const Cart=require('../model/cartSchema')
const Products=require('../model/Products')
const noCache= require('nocache')
const order= require('../model/orderSchema')
const Users= require('../model/User')
route.use(noCache());
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
router.get('/usercart',middleware.notlogged,cartController.cart)
router.post('/addingcart/:productid/:userid/:quantity',middleware.notlogged,cartController.addtocart)
// router.get('/usercheckout',cartController.checkout)
router.post('/updateQuantity',cartController.cartquantity)
router.post('/removeFromCart',cartController.removecart)
router.post('/addadress',cartController.addAddress)
router.post('/profileAddress',cartController.profileaddAddress)
router.get('/usercheckout',cartController.checkout)
router.get('/paymentmethod',cartController.checkout)

router.post('/placeorder',cartController.placecorder)

router.get('/profile',userController.userprofile)
router.post('/changepassword',userController.changepassword)
router.post('/submitprofile',userController.submitprofile)
router.post('/cancelOrder/:orderId/:productId',orderController.cancelorder)
router.delete('/removeaddress/:id',userController.removeAddress)
router.post('/updateaddress/:id',userController.editaddress)
router.post('/verifypayment',cartController.verfypayment)
router.post('/applyCoupon',orderController.applycoupon)



module.exports=router