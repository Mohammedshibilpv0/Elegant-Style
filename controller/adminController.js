const User = require("../model/User");
const Users = require("../model/User");
const Category=require('../model/category')
const Orders= require('../model/orderSchema')
const Products = require('../model/Products')
const Coupon=require('../model/couponSchema')
const offerSchema=require('../model/offerSchema')




const home = async (req, res) => {
  try {
    const admin = req.session.admin;
    const count = await Users.findOne().count();
    const totalorder = await Orders.findOne().count();
    const totalproduct = await Products.findOne().count();

    // chart for the payment
    const orders = await Orders.find().lean();
    const paymentModes = orders.reduce((acc, order) => {
      if (order.paymentMode !== undefined) {
        acc.push(order.paymentMode);
      }
      return acc;
    }, []);
    const paymentModeCounts = paymentModes.reduce((acc, mode) => {
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});

  const payment = orders.reduce((acc, order) => {
  if (order.paymentMode !== undefined) {
    order.Products.forEach(product => {
      const mode = order.paymentMode;
      const total = product.total;
      acc[mode] = (acc[mode] || 0) + total;
    });
  }
  return acc;
}, {});

const totalPrices = Object.values(payment);
const countsArray = Object.values(paymentModeCounts);

    const totalDeliveredOrders = await Orders.aggregate([
      {
        $unwind: '$Products',
      },
      {
        $match: {
          'Products.Status': 'delivered',
        },
      },
      {
        $group: {
          _id: '$_id',
          total: { $sum: '$Products.total' },
        },
      },
    ]);

    const totalDeliveredAmount = totalDeliveredOrders.reduce((acc, order) => acc + order.total, 0);
    const ordersData = await Orders.find();

    const monthlyData = transformDataForBarGraph(ordersData);
    console.log(monthlyData);

          const result = await Orders.aggregate([
              {
                  $match: {
                      'Products.Status': 'delivered',
                  },
              },
              {
                  $group: {
                      _id: {
                          year: { $year: '$date' },
                      },
                      totalSale: { $sum: '$total' },
                      totalOrders: { $sum: 1 },
                  },
              },
              {
                  $sort: {
                      '_id.year': 1,
                  },
              },
          ]);



  console.log(result);

    res.render("home", {
      admin,
      count,
      totalDeliveredAmount,
      totalorder,
      totalproduct,
      countsArray,
      totalPrices,
      monthlyData,
      result
    });
  } catch (err) {
    console.log(err);
  }
};

function transformDataForBarGraph(ordersData) {
  const monthlyData = {};

  // Initialize monthlyData with default values for all months
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    monthlyData[monthIndex] = { month: getMonthName(monthIndex), sales: 0, orders: 0 };
  }

  ordersData.forEach(order => {
    const month = order.date.getMonth(); // Assuming `date` is a Date field in your orders collection

    // Check if the product status is 'delivered' before updating the values
    const deliveredProducts = order.Products.filter(product => product.Status === 'delivered');

    monthlyData[month].sales += deliveredProducts.reduce((total, product) => total + product.total, 0);
    monthlyData[month].orders += deliveredProducts.length;
  });

  return Object.values(monthlyData);
}



// Helper function to get month name from month index
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}


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
      const admin = req.session.admin;
      const perPage = 6; // Set the number of users to display per page
      const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1

      const totalUsers = await Users.countDocuments({ Verified: true });
      const totalPages = Math.ceil(totalUsers / perPage);

      const userData = await Users.find({ Verified: true })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();

      res.render('allusers', { userData, admin, totalPages, currentPage: page });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
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
      const admin = req.session.admin;
      const perPage = 4; // Set the number of orders to display per page
      const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1

      const totalOrders = await Orders.countDocuments();
      const totalPages = Math.ceil(totalOrders / perPage);

      const allOrders = await Orders.find()
          .populate({
              path: 'Products.products',
              model: 'Products',
          })
          .populate('user', 'Name')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();
console.log(allOrders);
      res.render('allorders', { allOrders, admin, totalPages, currentPage: page });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
};


const changestatus = async (req, res) => {
  const { orderId } = req.params;
  const { status,productid,userid,orgproId } = req.body;
console.log(userid);

  try {
    if(status=="returned"){

      const checkuser= await Users.findOne({_id:userid})
      const checking= await Orders.findOne({_id:orderId,'Products._id': productid,})
      const productTotal = checking.Products.reduce((acc, product) => {
        return acc + (product.quantity * product.price);
      }, 0);
      checkuser.wallet=checkuser.wallet+productTotal
   const transaction = {
    amount: productTotal, // Negative value for deduction
    description: "Product Return",
    date: new Date(),
    status: "in",
    }

    checkuser.walletHistory.push(transaction);

    await checkuser.save()
      // Retrieve the order to get the list of cancelled products
      const productInfo = await Orders.findOne(
        { _id: orderId, 'Products._id': productid },
        { 'Products.$': 1 }
      );
  
      // Extract the quantity from the productInfo
      const quantity = productInfo.Products[0].quantity;
      const product= await Products.findById(orgproId)
      console.log(orgproId);
         product.Quantity=product.Quantity+quantity
        await product.save()

  }
    // Update the order status in the database
    const updatedOrder = await Orders.findOneAndUpdate(
      {
          _id: orderId,
          'Products._id': productid,
      },
      {
          $set: { 'Products.$.Status': status },
      },
      { new: true } // To return the updated document
  );

    console.log('Update result:', updatedOrder);

    if (updatedOrder.nModified === 0) {
      return res.status(404).json({ error: 'Order not found or status already updated' });
    }

    // Send a response indicating success
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const coupon= async (req,res)=>{
  try{
    const coupons= await Coupon.find()
    const admin= req.session.admin
    res.render("coupon",{admin,coupons})
  }catch(err){
    console.log(err);
  }
}

const addcoupon= async (req,res)=>{
  try{

      const admin=req.session.admin
      const message=req.flash('fail')
      res.render('addcoupon',{admin,message})

  }catch(err){
    console.log(err)
  }
}


const postaddcoupon= async (req,res)=>{
  try{

    let {name,code,min,Discount,description,expiryDate}=req.body
    console.log(req.body);
    const checkcoupon= await Coupon.findOne({couponName:name})
    const couponcode= await Coupon.findOne({couponCode:code})
    if(checkcoupon){
      const fail = "Name is already in the coupon list";
        req.flash("fail", fail);
        res.redirect('/admin/addcoupon')
    }
    if(couponcode){
      const fail = " Coupon code is already in the coupon list";
        req.flash("fail", fail);
        res.redirect('/admin/addcoupon')
    }
    const addcoupon= new  Coupon({
      couponName:name,
      couponCode:code,
      couponDescription:description,
      minAmount:min,
      discountamount:Discount,
      expiryDate:expiryDate
    })
    await addcoupon.save()

    res.redirect('/admin/coupon')

  }catch(err){
    console.log(err);
  }
}


const deleteCoupon = async (req,res)=>{
  try{
    console.log("hello");
    const couponid=req.params.id
    const deleteCoupon= await Coupon.deleteOne({_id:couponid})
    res.json({success:"deleted"})

  }catch(err){
    console.log(err);
  }
}


const saleReport= async (req,res)=>{
  try{
    const admin=req.session.admin
    res.render('report',{admin})

  }catch(err){
    console.log(err);
  }
}

const salesdata = async (req, res) => {
  try {
      const { startDate, endDate } = req.body;

      // Convert dates to JavaScript Date objects with time included
      const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
      const endDateTime = new Date(`${endDate}T23:59:59.999Z`);

      // Use aggregation to fetch orders within the specified date range
      const orders = await Orders.aggregate([
          {
              $match: {
                  date: { $gte: startDateTime, $lte: endDateTime },
                  'Products.Status': 'delivered' // Add this condition to filter by Status
              },
          },
          {
              $lookup: {
                  from: 'users', // The name of the User model collection in MongoDB
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user',
              },
          },
          {
              $unwind: '$user',
          },
          {
              $unwind: '$Products',
          },
          {
              $lookup: {
                  from: 'products', // The name of the products model collection in MongoDB
                  localField: 'Products.products',
                  foreignField: '_id',
                  as: 'Products.productInfo',
              },
          },
          {
              $unwind: '$Products.productInfo',
          },
          {
              $group: {
                  _id: '$_id',
                  user: { $first: '$user' },
                  Products: { $push: '$Products' },
                  total: { $sum: '$Products.productInfo.total' },
                  date: { $first: '$date' },
                  // Add other fields you need to include in the result
              },
          },
      ]);

      // Log orders count and dates
      console.log("Orders Count:", orders.length);
      console.log("Start Date:", startDateTime);
      console.log("End Date:", endDateTime);

      return res.status(200).json({
          status: "success",
          data: {
              orders,
              startDate: startDateTime,
              endDate: endDateTime,
          },
      });
  } catch (error) {
      console.error("Error generating sales report:", error);
      return res.status(500).json({ error: "Failed to generate sales report" });
  }
};


const offer= async (req,res)=>{
  try{
    const admin=req.session.admin
    const offer= await offerSchema.find()
    res.render('offer',{admin,offer})
  }catch(err){
    console.log(err);
  }
}

const addoffer= async (req,res)=>{
  try{
    const admin=req.session.admin
    const message=req.flash('msg')
    res.render('addoffers',{admin,message})
  }catch(err){
    console.log(err);
  }
}

const offerSubmit= async (req,res)=>{
  try{
    const {name,startingDate,endDate,percentage}=req.body
    const already=await offerSchema.findOne({name:name})
    if(already){
      const message="Offer is already exsits"
      req.flash('msg',message)
      res.redirect('/admin/addoffer')
    }
    const offer=new offerSchema({
      name:name,
      startingDate:startingDate,
      expiryDate:endDate,
      percentage:percentage
    })
    await offer.save()
    res.redirect('/admin/offer')
  }catch(err){
    console.log(err);
  }
}


 const editoffer= async (req,res)=>{
  try{
    const offerid=req.params.id
    const offer= await offerSchema.findById(offerid)
    const admin=req.session.admin
    res.render('editoffer',{admin,offer})
  }catch(err){
    console.log(err);
  }
 }


 const editofferSubmit= async (req,res)=>{
  try{
    const offerid=req.params.id
    const {name,startingDate,endDate,percentage}=req.body
    const update=await offerSchema.findByIdAndUpdate({_id:offerid},
      {
      name:name,
      startingDate:startingDate,
      expiryDate:endDate,
      percentage:percentage,
      }
      )
      res.redirect('/admin/offer')
  }catch(err){
    console.log(err);
  }
 }

 const applyoffer = async (req, res) => {
  try {
    const { offerid, productid } = req.body;

    // Assuming you have a Mongoose model for products
    const product = await Products.findOneAndUpdate(
      { _id: productid },
      { offer: offerid },
      { new: true }
    ).populate('offer');

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


const removeOffer = async (req,res)=>{
  try{
    const {offerid,productid}=req.body
    const product = await Products.findByIdAndUpdate(

      {_id:productid},
      {offer:null}  )
      
      await product.save()
      res.json({success:"true"})
  }catch(err){
    console.log(err);
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
  changestatus,
  coupon,
  addcoupon,
  postaddcoupon,
  deleteCoupon,
  saleReport,
  salesdata,
  offer,
  addoffer,
  offerSubmit,
  editoffer,
  editofferSubmit,
  applyoffer,
  removeOffer
};
