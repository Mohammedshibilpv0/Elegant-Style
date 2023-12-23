const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
const middleware=require("../middleware/User")
const productsController=require('../controller/products')





router.get('/',middleware.isBlock,userController.home)
router.get('/login',middleware.islogin,userController.login)
router.post('/register',middleware.islogin,userController.register)
router.post('/loginsubmit',middleware.islogin,userController.submitlogin)
router.get('/logout',userController.logout)

//products setting
router.get('/singleproduct/:id',productsController.singleProduct)

// Assuming you're using Express
router.post('/updateStatus', (req, res) => {
   const updatedStatus = Math.random();
   
   // Perform the status update logic here

   // Send the updated status back to the client
   res.json({ newStatus: updatedStatus });
});

 









module.exports=router