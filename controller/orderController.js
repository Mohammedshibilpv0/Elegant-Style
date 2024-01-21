const Products = require("../model/Products");
const Orders = require("../model/orderSchema");
const Coupon=require('../model/couponSchema')
const Cart=require('../model/cartSchema');
const { ConnectionStates } = require("mongoose");
const User = require("../model/User");


// const cancelorder = async (req, res) => {
//   const {orderId,productId}=req.params
  

//   try {
   
//     const user=await User.findOne({_id:req.session.user_id})
//     const updatedOrder = await Orders.updateOne(
//       {
//         _id: orderId,
//         'Products._id': productId,
//     },
//     {
//         $set: { 'Products.$.Status': "cancelled" },
//     }
//   );
//   const order= await Orders.findById(orderId)
//   for (const Products of order.Products) {
//     const productId = Products.products;
//     const quantity = Products.quantity;

//     // Update product stock by adding the cancelled quantity
//     await Products.findByIdAndUpdate(productId, {
//       $inc: { stock: quantity },
//     });
//   }
 

//   const checking= await Orders.findOne({_id:orderId,'Products._id': productId,})
//   if(checking.paymentMode=="Razorpay"){
//     const productTotal = checking.Products.reduce((acc, product) => {
//       return acc + (product.quantity * product.price);
//     }, 0);
//    user.wallet=user.wallet+productTotal
//    const transaction = {
//     amount: productTotal, // Negative value for deduction
//     description: "Product cancellation",
//     date: new Date(),
//     status: "in",
//   };
//   user.walletHistory.push(transaction);

//    await user.save()
//   }

//     // Send a response indicating success
//     res.json({
//       success: true,
//       message: "Product cancelled successfully",
//       updatedOrder,
//     });
//   } catch (error) {
//     console.error("Error cancelling product:", error.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
const cancelorder = async (req, res) => {
  const { orderId, productId,orgproId } = req.params;

  try {
    const user = await User.findOne({ _id: req.session.user_id });
    
    
    // Update the order status to "cancelled"
    const updatedOrder = await Orders.updateOne(
      { _id: orderId, 'Products._id': productId },
      { $set: { 'Products.$.Status': 'cancelled' } }
    );

    // Retrieve the order to get the list of cancelled products
    const productInfo = await Orders.findOne(
      { _id: orderId, 'Products._id': productId },
      { 'Products.$': 1 }
    );

    // Extract the quantity from the productInfo
    const quantity = productInfo.Products[0].quantity;
    const product= await Products.findById(orgproId)
       product.Quantity=product.Quantity+quantity
      await product.save()


    // Update user's wallet if payment mode is Razorpay
    const checking = await Orders.findOne({ _id: orderId, 'Products._id': productId });
    if (checking.paymentMode === 'Razorpay') {
      const productTotal = checking.Products.reduce((acc, product) => {
        return acc + product.total;
      }, 0);
      user.wallet = user.wallet + productTotal;
      const transaction = {
        amount: productTotal,
        description: 'Product cancellation',
        date: new Date(),
        status: 'in',
      };
      user.walletHistory.push(transaction);
      await user.save();
    }

    // Send a response indicating success
    res.json({
      success: true,
      message: 'Product cancelled successfully',
      updatedOrder,
    });
  } catch (error) {
    console.error('Error cancelling product:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};







// const cancelorder = async (req, res) => {
//   const { orderId, productId } = req.params;

//   try {
//     const user = await User.findOne({ _id: req.session.user_id });
//     const updatedOrder = await Orders.updateOne(
//       {
//         _id: orderId,
//         'Products._id': productId,
//       },
//       {
//         $set: { 'Products.$.Status': 'cancelled' },
//       }
//     );

//     const checking = await Orders.findOne({
//       _id: orderId,
//       'Products._id': productId,
//     });

//     if (checking.paymentMode === 'Razorpay') {
//       const productTotal = checking.Products.reduce((acc, product) => {
//         return acc + product.total;
//       }, 0);

//       // Increase the product quantity in the Products collection
//       const canceledProduct = checking.Products.find(
//         (product) => product._id.toString() === productId
//       );
//       console.log(canceledProduct);

//       if (!canceledProduct || !canceledProduct.products || !canceledProduct.products._id) {
//         console.error('Invalid canceled product structure:', canceledProduct);
//         return res.status(500).json({ success: false, message: 'Invalid canceled product structure' });
//       }

//       const product = await Products.findById(canceledProduct.products._id);
//       if (!product) {
//         console.error('Product not found:', canceledProduct.products._id);
//         return res.status(404).json({ success: false, message: 'Product not found' });
//       }

//       // Adjust the product quantity
//       product.Quantity += canceledProduct.quantity;
//       await product.save();

//       // Update user's wallet
//       user.wallet = user.wallet + productTotal;
//       const transaction = {
//         amount: productTotal,
//         description: 'Product cancellation',
//         date: new Date(),
//         status: 'in',
//       };
//       user.walletHistory.push(transaction);
//       await user.save();
//     }

//     // Send a response indicating success
//     res.json({
//       success: true,
//       message: 'Product cancelled successfully',
//       updatedOrder,
//     });
//   } catch (error) {
//     console.error('Error cancelling product:', error.message);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };






const returnRequest = async (req, res) => {
  const { orderId, productId } = req.params;
  const { reason } = req.body; // Assuming the reason is sent in the request body

  console.log(req.params);

  try {
      const updatedOrder = await Orders.updateOne(
          {
              _id: orderId,
              'Products._id': productId,
          },
          {
              $set: {
                  'Products.$.Status': 'request return',
                  'Products.$.reason': reason,
              },
          }
      );

      // Send a response indicating success
      res.json({
          success: true,
          message: 'Product return requested successfully',
          updatedOrder,
      });
  } catch (error) {
      console.error('Error requesting product return:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const applycoupon = async (req, res) => {
  try {
    const userId = req.session.user_id; // Consistent naming
    const { couponCode,checkprice } = req.body;

    const coupon = await Coupon.findOne({ couponCode });
  
 
    if (coupon) {
      const couponid=coupon._id
      const alreadyUsed = coupon.userUsed.some((user) => user.user_id.toString() === userId);

      if (!alreadyUsed) {
        if(coupon.minAmount<=checkprice){
          const currentDate = new Date();
          if (coupon.expiryDate > currentDate) {
          const couponName = coupon.couponName;

          // Save the updated coupon to the database
          await coupon.save();
          const cartData = await Cart.findOne({ userid: userId }).populate({
            path: "products.productId",
            model: "Products", // Make sure it matches the model name for the Product
          });
  
  
            const  totalPriceTotal = cartData.products.reduce((total, product) => {
              return total + product.totalPrice;
            }, 0);
  
           const discount =totalPriceTotal-coupon.discountamount
  
  
          res.json({ success: `${couponName} `,totalPriceTotal,discount,couponid });
          }else{
            res.json({ already: 'Coupen date expired' });
          }
        }else{
          res.json({minimum:`Coupon not added Minimum purchase ₹ ${coupon.minAmount}`})
        }
   
      } else {
        res.json({ already: 'Coupon already used by this user' });
      }
    } else {
      res.json({ error: 'Coupon not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const vieworder= async (req,res)=>{
  try{

    const orderid=req.params.id
    const orders = await Orders.find({ _id:orderid})
    .populate({
        path: 'Products.products',
        model: 'Products'
    })
    .exec();
  
    res.render("orderdetail",{orders})

  }catch(err){
    console.log(err);
  }
}


module.exports = {
  cancelorder,
  applycoupon,
  vieworder,
  returnRequest
};

