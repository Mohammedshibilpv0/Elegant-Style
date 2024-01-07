const User = require("../model/User");
const Users = require("../model/User");
const Category=require('../model/category')
const Orders= require('../model/orderSchema')
const Products = require('../model/Products')
const home = async (req, res) => {
  try {
    const admin=req.session.admin
    const count= await Users.findOne().count()
    res.render("home",{admin,count});
  } catch (err) {
    console.log(err);
  }
};
const login = (req, res) => {
  try {
    const errmsg = req.flash("err");
    res.render("adminlogin", { errmsg });
  } catch (err) {
    console.log(err);
  }
};

//verifyAdmin

const verifyAdmin = (req, res) => {
  try {
    const email = process.env.adminEmail;
    const password = process.env.adminPassword;
    const name = process.env.adminName;
    if (email == req.body.email && password == req.body.password) {
      req.session.admin = name;
      res.redirect("/admin");
    } else {
      const errormsg = "Admin not found";
      req.flash("err", errormsg);
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err);
  }
};

const logout = (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
  }
};

const allUsers = async (req, res) => {
  try {
    const admin=req.session.admin
    const userData = await Users.find({Verified:true});
    console.log(userData);
    res.render("allusers", { userData,admin });
  } catch (err) {
    console.log(err);
  }
};

const unblockUser = async (req, res) => {
  try {
    const user_id = req.params.id;
    const check = await Users.findOne({ _id: user_id });                  //unblock user
    if (check.Status == "blocked") {
      const unblock = await Users.updateOne(
        { _id: user_id },
        { Status: "active" }
      );
      const userstatus=await Users.findOne({_id:user_id})
      const status=userstatus.Status
      res.json({status:status})
      }
  } catch (err) {
    console.log(err);
  }
};

const blockUser = async (req, res) => {
  try {
    const user_id = req.params.id;
    const checkUser = await Users.findOne({ _id: user_id });              //block user

    if (checkUser.Status == "active") {
      const blocked = await Users.updateOne(
        { _id: user_id },
        { Status: "blocked" }
      );
      const userstatus=await Users.findOne({_id:user_id})
      const status=userstatus.Status
      res.json({status:status})
    }
    
  } catch (err) {
    console.log(err);
  }
};




 const category= async (req,res)=>{
  try{
    const admin=req.session.admin
    const succ = req.flash("succ");
    const category= await Category.find()
    res.render('category',{admin,succ,category})
  }catch(err){
    console.log(err);
  }
 }


 const addCategory=(req,res)=>{

  try{
    const admin=req.session.admin
    res.render('addcategory',{admin})

  }catch(err){
    console.log(err);
  }
 }

 const submitCategory= async (req,res)=>{
   try{

      const name=req.body.categoryname
      const desc=req.body.categorydesc
      const iscategory = await Category.findOne({Name:name})                //category checking
      if(iscategory){
        const succ = "already in the category list";
        req.flash("succ", succ);
        res.redirect('/admin/category')
      }else{
        const category= new Category({
          Name:name,                                                        // inserting new category
          Description:desc
        })

        const check= await category.save()
        res.redirect('/admin/category')
      }


   }catch(err){
    console.log(err);
   }
 }


   const unlistCategory= async (req,res)=>{
    try{
      
      const category_id=req.params.id
      const check= await Category.findOne({_id:category_id})                              //for unlist the category
      if(check.Status=="active"){
       const category= await Category.updateOne({_id:category_id},{Status:"blocked"})
       const check= await Category.findOne({_id:category_id})
       const status=check.Status
   
        res.json({status:status})
      }
    }catch(err){
      console.log(err);
    }
   }

   const listCategory= async (req,res)=>{
    try{

      const category_id=req.params.id
                                                  //list the category
      const check= await Category.findOne({_id:category_id})
      if(check.Status=="blocked"){
       const category = await Category.updateOne({_id:category_id},{Status:"active"})
       const check= await Category.findOne({_id:category_id})
       const status=check.Status
        res.json({status:status})
      }
    }catch(err){
      console.log(err);
    }
   }


   const editcategory= async (req,res)=>{
    try{
      const admin=req.session.admin
      const category_id=req.params.id
      const editcategory= await Category.findOne({_id:category_id})
      res.render('editcategory',{editcategory,admin})


    }catch(err){
      console.log(err);
    }
   }


   const submiteditcategory= async(req,res)=>{
    try{
      const category_id= req.params.id
     const updatecategory= await Category.findOne({_id:category_id})
    
      if(updatecategory){
      await Category.findByIdAndUpdate({_id:category_id},{
        Name:req.body.categoryname,
        Description:req.body.categorydesc
      })
     }else{
      res.redirect('/admin/category')
     }
    
   
     res.redirect('/admin/category')
    }catch(err){
      console.log(err);
    }
   }

   const allorders = async (req, res) => {
    try {
      const admin= req.session.admin
      const allOrders = await Orders.find()
      .populate({
          path: 'Products.products',
          model: 'Products'
      }).populate('user', 'Name').exec();


        res.render('allorders', { allOrders,admin});
    } catch (err) {
        console.error(err);
        // Handle the error and send an appropriate response
        res.status(500).send('Internal Server Error');
    }
};


const changestatus = async (req,res)=>{
  const { orderId } = req.params;
  const { status } = req.body;

  try {
      // Update the order status in the database
      const updatedOrder = await Orders.findByIdAndUpdate(orderId, { $set: { 'Products.$[element].orderStatus': status } }, { arrayFilters: [{ 'element.orderStatus': { $ne: status } }] });

      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Send a response indicating success
      res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
  home,
  login,
  verifyAdmin,
  logout,
  allUsers,
  unblockUser,
  blockUser,
  category,
  addCategory,
  submitCategory,
  unlistCategory,
  listCategory,
  editcategory,
  submiteditcategory,
  allorders,
  changestatus
};
