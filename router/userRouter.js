const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
const middleware=require("../middleware/User")
const productsController=require('../controller/products')





router.get('/',middleware.isBlock,userController.home)
router.get('/login',middleware.islogin,userController.login)
router.get('/signup',middleware.islogin,userController.signup)
router.post('/register',middleware.islogin,userController.register)
router.post('/loginsubmit',middleware.islogin,userController.submitlogin)


router.get('/logout',userController.logout)

//products setting
router.get('/singleproduct/:id',productsController.singleProduct)



router.get('/otp',userController.loadOtp);

router.post('/otp',userController.verifyOtp);






module.exports=router