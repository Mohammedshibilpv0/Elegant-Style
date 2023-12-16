const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
const middleware=require("../middleware/User")





router.get('/',userController.home)
router.get('/login',middleware.islogin,userController.login)
router.post('/register',middleware.islogin,userController.register)
router.post('/loginsubmit',middleware.islogin,userController.submitlogin)
router.get('/logout',userController.logout)











module.exports=router