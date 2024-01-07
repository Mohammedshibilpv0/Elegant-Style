const User = require("../model/User");
const bcrypt = require("bcrypt");
const Products=require('../model/Products')
const Category=require('../model/category')
const userOtpVerification=require('../model/otpVerify')
const nodemailer=require('nodemailer')
const Cart=require('../model/cartSchema')




const home = async (req, res) => {
  try {
    const productsdetail = await Products.find({Status: { $ne: "blocked" }}).populate('Category').exec();
    const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length||0
    const userName = await User.findOne({_id:req.session.user_id})
    
    const userid= req.session.user_id
    const Product = productsdetail.filter(product => product.Category.Status !== "blocked");
    res.render("home", { userName, Product,count,userid });
  } catch (err) {
    console.log(err);
    // Handle the error appropriately, perhaps by rendering an error page
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

    const errmsg = req.flash("err");
    const succmsg = req.flash("succ");
    res.render("register", { errmsg,succmsg });

  } catch (err) {
    console.log(err);
  }
};


const register = async (req, res) => {

  try {
    const emailCheck = await User.findOne({ Email: req.body.email });
    if (emailCheck) {
    
      const errmsg = "Email already exist";
      req.flash("err", errmsg);
      res.redirect("/login");
 
  } else {
      const Password = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        Name: req.body.name,
        Email: req.body.email,
        Password: Password,
        Verified:false
      });
      const check = await user.save();
      
  
      sendOTPverificationEmail(user, res);
    }
  } catch (err) {
    console.log(err);
  }
};

const sendOTPverificationEmail = async ({Email} , res) => {

  try {
    
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'mazziotechlounger@gmail.com',
              pass: 'lrdy kzvc krph itja'
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
      
      res.redirect(`/otp?email=${Email}`);
     

  } catch (err) {
      console.log(err.message);
  }
};

const loadOtp = async (req, res) => {
  try {
      const email = req.query.email;


      console.log(email)

      res.render('otpVerification', {email: email});

  } catch (error) {
      console.log(error);

  }
}

const verifyOtp = async (req, res) => {
  try {
      const email = req.body.email;

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


const submitlogin = async (req, res) => {
  try {
    const check = await User.findOne({ Email: req.body.logemail });
    

    if (check) {
      const passwordMatch = await bcrypt.compare(
        req.body.logpassword,
        check.Password
      );

      if (passwordMatch) {
        if (check.Status == "active") {
          req.session.user = check.Name;
          req.session.user_id=check._id
          req.session.email = check.Email;
          res.redirect("/");
        } else {
          const errormsg = "You are blocked by admin";
          req.flash("err", errormsg);
          res.redirect("/login");
        }
      } else {
        const errormsg = "User not found";
        req.flash("err", errormsg);
        res.redirect("/login");
      }
    } else {
      const errormsg = "User not found";
      req.flash("err", errormsg);
      res.redirect("/login"); // Handle the case where the user with the specified email is not found
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error"); // Handle other errors gracefully
  }
};

const allproducts= async (req,res)=>{
  try{

    const productsdetail = await Products.find({Status: { $ne: "blocked" }}).populate('Category').exec();
    const product = productsdetail.filter(product => product.Category.Status !== "blocked");
    const user=req.session.user_id
    res.render('allproducts',{product,user})

  }catch(err){
    console.log(err);
  }
}



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
  verifyOtp,
  loadOtp,
  submitlogin,
  signup,
  allproducts,
  changepassword,
  submitprofile,
  logout,
};
