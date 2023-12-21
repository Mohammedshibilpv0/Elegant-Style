const User = require("../model/User");
const bcrypt = require("bcrypt");
const Products=require('../model/Products')

const home = async (req, res) => {
  try {
    const Product= await Products.find()
    const userName = req.session.user;
    res.render("home", { userName,Product });
  } catch (err) {
    console.log(err);
  }
};

const login = (req, res) => {
  try {
    const errmsg = req.flash("err");
    res.render("login", { errmsg });
  } catch (err) {
    console.log(err);
  }
};

const register = async (req, res) => {
  try {
    const emailCheck = await User.findOne({ Email: req.body.regemail });
    if (emailCheck) {
      const errmsg = "Email already exist";
      req.flash("err", errmsg);
      res.redirect("/login");
    } else {
      const Password = await bcrypt.hash(req.body.regpassword, 10);
      const user = new User({
        Name: req.body.regname,
        Email: req.body.regemail,
        Password: Password,
      });
      const check = await user.save();
      if (check) {
        res.redirect("/login");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

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
          req.session.email = check.Email;
          res.redirect("/");
        } else {
          const errormsg = "You are blocked by admin";
          req.flash("err", errormsg);
          res.redirect("/login");
        }
      } else {
        const errormsg = "User not found please register first";
        req.flash("err", errormsg);
        res.redirect("/login");
      }
    } else {
      const errormsg = "User not found please register first";
      req.flash("err", errormsg);
      res.redirect("/login"); // Handle the case where the user with the specified email is not found
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error"); // Handle other errors gracefully
  }
};

const logout = (req, res) => {
  try {
    req.session.user = null;
    req.session.email = null;
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  home,
  login,
  register,
  submitlogin,
  logout,
};
