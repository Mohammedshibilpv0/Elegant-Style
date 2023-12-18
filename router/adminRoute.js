const express=require("express")
const adminRoute=express()
const adminController=require('../controller/adminController')
const middleware=require('../middleware/admin')
const productsController=require('../controller/products')
const Category=require('../model/category')
const multer=require('multer')
const path=require('path')

adminRoute.set('views','./views/admin')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create the Multer instance with the storage configuration
  const upload = multer({ storage: storage });
  
  // Serve static files from the 'public' directory
  adminRoute.use(express.static(path.join(__dirname, 'public')));



adminRoute.get('/',middleware.verify,adminController.home)
adminRoute.get('/login',middleware.isLogin,adminController.login)
adminRoute.get('/allusers',middleware.verify,adminController.allUsers)
adminRoute.post('/login',middleware.isLogin,adminController.verifyAdmin)
adminRoute.get('/logout',middleware.verify,adminController.logout)
adminRoute.get('/unblockuser/:id',middleware.verify,adminController.unblockUser)
adminRoute.get('/blockuser/:id',middleware.verify,adminController.blockUser)
adminRoute.get('/category',middleware.verify,adminController.category)
adminRoute.get('/addcategory',middleware.verify,adminController.addCategory)
adminRoute.post('/addcategory',middleware.verify,adminController.submitCategory)
adminRoute.get('/unlistcategory/:id',middleware.verify,adminController.unlistCategory)
adminRoute.get('/listcategory/:id',middleware.verify,adminController.listCategory)


//product controller
adminRoute.get('/addproduct',productsController.addProducts)
  adminRoute.post('/upload', upload.single('file'),productsController.uploadProducts);




module.exports=adminRoute