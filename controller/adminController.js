const User = require("../model/User");
const Users = require("../model/User");
const Category=require('../model/category')

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
    const userData = await Users.find();
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
      res.redirect("/admin/allusers");
    } else {
      res.redirect("/admin/allusers");
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
      res.redirect("/admin/allusers");
    } else {
      res.redirect("/admin/allusers");
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
      const category_id=req.params.id
      const check= await Category.findOne({_id:category_id})                              //for unlist the category
      if(check.Status=="active"){
       await Category.updateOne({_id:category_id},{Status:"blocked"})
        res.redirect('/admin/category')
      }
   }

   const listCategory= async (req,res)=>{
      const category_id=req.params.id                                                       //list the category
      const check= await Category.findOne({_id:category_id})
      if(check.Status=="blocked"){
        await Category.updateOne({_id:category_id},{Status:"active"})
        res.redirect('/admin/category')
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
  listCategory
};
