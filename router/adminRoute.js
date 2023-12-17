const express=require("express")
const adminRoute=express()
const adminController=require('../controller/adminController')
const middleware=require('../middleware/admin')


adminRoute.set('views','./views/admin')


adminRoute.get('/',middleware.verify,adminController.home)
adminRoute.get('/login',middleware.isLogin,adminController.login)
adminRoute.get('/allusers',adminController.allusers)
adminRoute.post('/login',adminController.verifyAdmin)
adminRoute.get('/logout',adminController.logout)

module.exports=adminRoute