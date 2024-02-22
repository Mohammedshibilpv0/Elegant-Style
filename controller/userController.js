const User = require("../model/User");
const bcrypt = require("bcrypt");
const Products=require('../model/Products')
const Category=require('../model/category')
const userOtpVerification=require('../model/otpVerify')
const nodemailer=require('nodemailer')
const Cart=require('../model/cartSchema')
const Orders= require('../model/orderSchema')
const Coupon=require('../model/couponSchema');
const wishlistSchema=require('../model/wishlistSchema')
const { wishlist } = require("./wishlistController");
require('dotenv').config()
const crypto=require('crypto')
const resetpasswordSchema=require('../model/resetpassword')

const home = async (req, res) => {
  try {
      const perPage = 8; // Set the number of products to display per page
      const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1

      const productsdetail = await Products.find({ Status: { $ne: "blocked" } })
      .populate({
          path: 'Category',
          populate: { path: 'offer' }
      }).populate('offer')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

      const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const userName = await User.findOne({ _id: req.session.user_id });

      const userid = req.session.user_id;
      const Product = productsdetail.filter(product => product.Category.Status !== "blocked");

      const totalProducts = await Products.countDocuments({ Status: { $ne: "blocked" } });
      const totalPages = Math.ceil(totalProducts / perPage);

      res.render("home", { userName, Product, count, userid, totalPages, currentPage: page,wishlistcount });
  } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
  }
};


const login = (req, res) => {
  try {

    const errmsg = req.flash("err");
    const succmsg = req.flash("succ");
    res.render("login", { errmsg,succmsg });

  } catch (err) {
    console.log(err);
  }
};

const signup = (req, res) => {
  try {
    let Referal =req.query.referralCode
    const errmsg = req.flash("err");
    const succmsg = req.flash("succ");
    res.render("register", { errmsg,succmsg,Referal });

  } catch (err) {
    console.log(err);
  }
};


const register = async (req, res) => {

  try {
    let refer=req.body.Referal
    const emailCheck = await User.findOne({ Email: req.body.email });
    if (emailCheck && emailCheck.Verified) {
    
      const errmsg = "Email already exist";
      req.flash("err", errmsg);
      res.redirect("/login");
 
  } else {
      const Password = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        Name: req.body.name,
        Email: req.body.email,
        Password: Password,
        Referid:Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000,
        Verified:false
      });
      const check = await user.save();

      sendOTPverificationEmail(user, res,refer);
    }
  } catch (err) {
    console.log(err);
  }
};

const sendOTPverificationEmail = async ({Email} , res,refer) => {

  try {
    
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'mazziotechlounger@gmail.com',
              pass: 'imbv sshe dpux ttba'
          }
      });

      otp = `${
          Math.floor(1000 + Math.random() * 9000)
      }`;

      // mail options
      const mailOptions = {
        from: 'mazziotechlounger@gmail.com',
        to: Email,                        /// Make sure 'email' is a valid recipient email address
        subject: "Verify Your email",
        html: `Your OTP is: ${otp}`
    };

      // hash the otp
      const saltRounds = 10;
      const hashedOTP = await bcrypt.hash(otp, saltRounds);

      const newOtpVerification = await new userOtpVerification({email: Email, otp: hashedOTP});
      console.log(newOtpVerification+"otp verification")
      // save otp record
      await newOtpVerification.save();
      console.log('Recipient email:', Email);
      console.log('Mail options:', mailOptions);
      await transporter.sendMail(mailOptions);

      res.redirect(`/otp?email=${Email}&refer=${refer}`);

  } catch (err) {
      console.log(err.message);
  }
};

const loadOtp = async (req, res) => {
  try {
      const email = req.query.email;
      const refer=req.query.refer
      res.render('otpVerification', {email: email,refer});

  } catch (error) {
      console.log(error);

  }
}

const verifyOtp = async (req, res) => {
  try {
      const email = req.body.email;
      const refer=req.body.refer
      console.log('email', req.body.email);
      const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;

      const userVerification = await userOtpVerification.findOne({email: email});
      console.log('userVerification:', userVerification);

      if (! userVerification) {
          console.log("otp expired")
          req.flash('error', 'otp expired');
          res.redirect('/login')

          return;
      }

      const {otp: hashedOtp} = userVerification;

      const validOtp = await bcrypt.compare(otp, hashedOtp);
      console.log(validOtp);


      if (validOtp) {
          const userData = await User.findOne({Email: email});

          if (userData) {
              await User.findByIdAndUpdate(
                 { _id:userData._id} , {Verified:true}
              );

          }

          // delete theOTPrecord
          const user = await User.findOne({Email: email})
        console.log(user.Status);
          await userOtpVerification.deleteOne({email: email});
          if (user.Verified==true) {
              if (user.Status!=="blocked") {
                const checkingRefer=await User.findOne({Referid:refer})
                console.log(checkingRefer);

                if(refer&&checkingRefer){
                  let user=await User.findOne({Email:email})
                  user.wallet=user.wallet+100
                  const transaction = {
                    amount: 100,
                    description: "Referal",
                    date: new Date(),
                    status: "in",
                    }
                    user.walletHistory.push(transaction)
                    await user.save()

                    checkingRefer.wallet=checkingRefer.wallet+200
                    const transactionRef = {
                      amount: 200,
                      description: "Referal",
                      date: new Date(),
                      status: "in",
                      }

                    checkingRefer.walletHistory.push(transactionRef)
                    await  checkingRefer.save()
                }
                req.flash('succ', 'successfully register please login');
                  res.redirect('/login');
              } else {

                  console.log("user blocked from this site");


                  req.flash('err', 'you are blocked from this contact with admin');
                  res.redirect('/login')

              }

          }else{

          }
         } else {

          await User.deleteOne({Email:email})
          req.flash('err', 'otp is incorrect you have to verifey again login to get otp');
          res.redirect('/login')

      }

  } catch (error) {
      console.log(error);
  }
};



const resendOtp = async (req, res) => {
  try {

      const userEmail = req.query.email;
      await userOtpVerification.deleteMany({email: userEmail});
      console.log(userOtpVerification)
      console.log("User Email:", userEmail);
      if (userEmail) {
          sendOTPverificationEmail({
              email: userEmail
          }, res);
      } else {

          console.log("User email not provided in the query");

      }

  } catch (error) {
      console.log(error);

  }
} 


const forgetpassword= async (req,res)=>{
  try{
    const message=req.flash('error')
    const success=req.flash('success')
    res.render('forgetpassword',{message,success})
  }catch(err){
    console.log(err);
  }
}

const forgetpasswordPost = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ Email: email });

    if (!user) {
      const message = "User not found";
      req.flash('error', message);
      return res.redirect('/forgetpassword');
    }
    const already= await resetpasswordSchema.deleteOne({userId:user._id})

    const token = Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    const reset= new resetpasswordSchema({
      userId:user._id,
      token:token,
    })
    await reset.save()
   const resetUrl = `https://elegantstyle.cloud/resetingPass/${token}`
    let transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'mazziotechlounger@gmail.com',
              pass: 'imbv sshe dpux ttba'
          }
  });

      await transporter.sendMail({
      to: user.Email,
      subject: 'Reset your password',
      html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>
            Please click on the following link, or paste this into your browser to complete the process:<br><br>
            <a href="${resetUrl}">${resetUrl}</a><br><br>
            If you did not request this, please ignore this email and your password will remain unchanged.<br>`
    });
    const success="Please Check Your Email"
    req.flash('success',success)
    res.redirect('/forgetpassword'); // Redirect to the forget password page
  } catch (err) {
    console.log(err);
    // Handle errors appropriately
  }
}

const resetpassword= async (req,res)=>{
  try{
      const token=req.params.id
      const checking=await resetpasswordSchema.findOne({token:token})
      if(!checking){
        return res.redirect('/notfound')
      }else{
        const message=req.flash('message')
        const errmsg=req.flash('err')
        const userId=checking.userId
        res.render('resetpassword',{userId,token,message,errmsg})
      }

  }catch(err){
    console.log(err);
  }
}

const changePasswordInReset = async (req, res) => {
  try {
    const { newpassword, confirmpassword, userid,token } = req.body;

    if (newpassword !== confirmpassword) {
      const message="Passwords do not match"
      req.flash('err',message)
      return res.redirect(`/resetingPass/${token}`)
    }


  
    const user = await User.findById(userid);

    if (!user) {
      const message='User not found'
      req.flash('err',message)
      return res.redirect(`/resetingPass/${token}`)

    }
    const Password = await bcrypt.hash(newpassword, 10);
    // Update the user's password
    user.Password = Password;
    await user.save();
    const message='Password changed successfully'
    req.flash('message',message)
    const deletingToken= await resetpasswordSchema.deleteOne({token:token})
    return res.redirect(`/successpassword`)
  } catch (error) {
    console.error('Error changing password:', error);
  }
};

const successpassword=(req,res)=>{
  try{
      res.send('success')
  }catch(err){
    console.log(err);
  }
}

const submitlogin = async (req, res) => {
  try {
    const check = await User.findOne({ Email: req.body.logemail });

    if (check === null) { // Check if no user with the specified email is found
      const errormsg = "User not found";
      req.flash("err", errormsg);
      return res.redirect("/login");
    }

    if (!check.Verified) {
      const errormsg = "Please register first";
      req.flash("err", errormsg);
      return res.redirect("/signup");
    }

    const passwordMatch = await bcrypt.compare(req.body.logpassword, check.Password);

    if (passwordMatch) {
      if (check.Status === "active") {
        req.session.user = check.Name;
        req.session.user_id = check._id;
        req.session.email = check.Email;
        return res.redirect("/");
      } else {
        const errormsg = "You are blocked by admin";
        req.flash("err", errormsg);
        return res.redirect("/login");
      }
    } else {
      const errormsg = "Incorrect password";
      req.flash("err", errormsg);
      return res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};


const allproducts = async (req, res) => {
  try {

      const perPage = 8; // Set the number of products to display per page
      const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1
      const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const userName = await User.findOne({ _id: req.session.user_id });
      const category= await Category.find({Status: { $ne: "blocked" }})
      let query = { Status: { $ne: "blocked" } }; // Initial query to get all products

      // Check if search query parameter exists
      if (req.query.q) {
          // If search query parameter exists, update the query to filter products by name or category
          const searchRegex = new RegExp(req.query.q, 'i');
          query.$or = [
              { Name: { $regex: searchRegex } }, // Search product name
              { Category: { $in: await Category.find({ Name: { $regex: searchRegex } }).distinct('_id') } }
          ];
      }

      const productsdetail = await Products.find(query)
          .populate('Category')
          .populate({
              path: 'Category',
              populate: { path: 'offer' }
          }).populate('offer')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();

      const product = productsdetail.filter(product => product.Category.Status !== "blocked");
      const user = req.session.user_id;
      const totalProducts = await Products.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / perPage);
      res.render('allproducts',{ product, user, totalPages, currentPage: page, userName, count, category, wishlistcount });

  } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
  }
};

const fetchingProduct = async (req, res) => {
  try {
  
      const perPage = 8; // Set the number of products to display per page
      const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1
      const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const userName = await User.findOne({ _id: req.session.user_id });
      const category= await Category.find({Status: { $ne: "blocked" }})
      let query = { Status: { $ne: "blocked" } }; // Initial query to get all products

      // Check if search query parameter exists
      if (req.query.q) {
          // If search query parameter exists, update the query to filter products by name or category
          const searchRegex = new RegExp(req.query.q, 'i');
          query.$or = [
              { Name: { $regex: searchRegex } }, // Search product name
              { Category: { $in: await Category.find({ Name: { $regex: searchRegex } }).distinct('_id') } } 
          ];
      }

      const productsdetail = await Products.find(query)
          .populate('Category')
          .populate({
              path: 'Category',
              populate: { path: 'offer' }
          }).populate('offer')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();

      const product = productsdetail.filter(product => product.Category.Status !== "blocked");
      const user = req.session.user_id;
      const totalProducts = await Products.countDocuments(query)
      const totalPages = Math.ceil(totalProducts / perPage);
      res.json({ product, user, totalPages, currentPage: page, userName, count, category, wishlistcount });

  } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
  }
};

const searchProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const checkingProduct = await Products.findOne({ _id: id });
    const checkingCategory = await Category.findOne({ _id: id });
    const wishlistcount = (await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const category = await Category.find({ Status: { $ne: "blocked" } });
    const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const user = req.session.user_id;
    const userName = await User.findOne({ _id: req.session.user_id });

    let product = [];

    if (checkingProduct && checkingProduct.Status === "active") {
      product.push(checkingProduct);
    } else if (checkingCategory && checkingCategory.Status === "active") {
      product.push(checkingCategory);
    }

    res.render('searchproducts', { product, user, userName, count, category, wishlistcount });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};




const changepassword = async (req, res) => {
  const currentPassword = req.body.password;
  const newPassword = req.body.newpassword;
  const confirmPassword = req.body.confirmpassword;
  const userId = req.session.user_id; // Assuming you store the user's ID in the session

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the current password
    if (currentPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.Password);

      if (!passwordMatch) {
        return res.json({ message: 'Current password is incorrect' });
      }
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.json({ message: 'New password and confirm password do not match' });
    }

    // Update the user's password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.Password = hashedPassword;

    // Save the updated user data
    await user.save();

    // Send a success response with a message
    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    
    // Send an error response with a message
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const submitprofile = async (req, res) => {
  try {
    // Retrieve the user by ID
    const user = await User.findOne({ _id: req.session.user_id });
    // Check if the user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Update the user's name
    user.Name =req.body.name
    // Save the updated user data
    await user.save();

    return res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (err) {
    console.error('Error submitting profile:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const userprofile= async (req,res)=>{
  try{
    const userid=req.session.user_id
    const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const userdetails = await User.findOne({ _id: userid });
    const deleteorder= await Orders.deleteMany({paymentStatus:"pending"})
    const orders = await Orders.find({user:userid})
    const userName = await User.findOne({ _id: req.session.user_id });
    const coupon= await Coupon.find()
    res.render('userprofile',{userdetails,orders,coupon,userName,count,wishlistcount})
  }catch(err){
    console.log(err);
  }
}

const removeAddress = async (req,res)=>{
  try{
    const userId = req.session.user_id;
    const addressId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Pull the address with the given ID from the Addresses array
    user.Addresses.pull({ _id: addressId });
    res.status(200).json({ message: 'Address removed successfully' });

    // Save the updated user document
    await user.save();
  }catch(err){
    console.log(err);
  }
}

const editaddress = async (req, res) => {
  try {
    const addressfind = await User.findOne({ _id: req.session.user_id });

    if (!addressfind) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    const value =  req.body.address
    console.log(value);

    const specificaddress = addressfind.Addresses.find((add) => add.address === req.body.address);
console.log(specificaddress);

    


    if (specificaddress) {
      // Update the specific address fields
      specificaddress.location = req.body.location;
      specificaddress.address = req.body.address;
      specificaddress.city = req.body.city;
      specificaddress.zip = req.body.zip;
      specificaddress.phone = req.body.phone;
      specificaddress.email = req.body.email;
      specificaddress.state = req.body.state;

      try {
        // Use findOneAndUpdate to directly update the specific address
        await User.findOneAndUpdate(
          { _id: req.session.user_id, 'Addresses.address': req.body.address },
          {
            $set: {
              'Addresses.$.location': req.body.location,
              'Addresses.$.address': req.body.address,
              'Addresses.$.city': req.body.city,
              'Addresses.$.zip': req.body.zip,
              'Addresses.$.phone': req.body.phone,
              'Addresses.$.email': req.body.email,
              'Addresses.$.state': req.body.state,
            },
          }
        );

        console.log('Address updated successfully');
        res.status(200).json({ message: 'Address updated successfully' });
      } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      console.log('Specific address not found');
      // Handle the case where the specific address is not found
      res.status(404).json({ message: 'Specific address not found' });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const categorybased= async(req,res)=>{
  try{
    const perPage = 8; // Set the number of products to display per page
    const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1
    const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const categoryid =req.params.id
    const user=req.session.user_id
    const totalProducts = await Products.countDocuments({Category:categoryid},{ Status: { $ne: "blocked" } });
    const totalPages = Math.ceil(totalProducts / perPage);
    const product= await Products.find({Category:categoryid}).populate({
      path: 'Category',
      populate: { path: 'offer' } // Populate the offer field in the Category document
  }).populate('offer')
    const category= await Category.find({Status: { $ne: "blocked" }})
    res.render('categorybased',{product,user,category,totalPages, currentPage: page,wishlistcount})

  }catch(err){
    console.log(err);
  }
}


const logout = (req, res) => {
  try {
    req.session.user = null;
    req.session.email = null;
    req.session.user_id=null;
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  home,
  login,
  register,
  resendOtp,
  forgetpassword,
  forgetpasswordPost,
  resetpassword,
  changePasswordInReset,
  successpassword,
  verifyOtp,
  loadOtp,
  submitlogin,
  signup,
  allproducts,
  searchProduct,
  fetchingProduct,
  changepassword,
  submitprofile,
  userprofile,
  logout,
  removeAddress,
  editaddress,
  categorybased,

};
