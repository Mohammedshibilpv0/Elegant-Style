const Products = require("../model/Products");
const Orders = require("../model/orderSchema");
const Coupon=require('../model/couponSchema')
const Cart=require('../model/cartSchema');
const { ConnectionStates } = require("mongoose");
const cancelorder = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId.trim(); // Trim whitespaces

  try {
    const updatedOrder = await Orders.updateOne(
      {
          _id: orderId,
          'Products._id': productId
      },
      {
          $set: {
              'orderStatus': 'cancelled'
          }
      }
  );
    // Send a response indicating success
    res.json({
      success: true,
      message: "Product cancelled successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error("Error cancelling product:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const applycoupon = async (req, res) => {
  try {
    const userId = req.session.user_id; // Consistent naming
    const { couponCode } = req.body;

    const coupon = await Coupon.findOne({ couponCode });

    if (coupon) {
      const alreadyUsed = coupon.userUsed.some((user) => user.user_id.toString() === userId);

      if (!alreadyUsed) {
        coupon.userUsed.push({ user_id: userId });
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


        res.json({ success: `${couponName} added`,totalPriceTotal,discount });
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



module.exports = {
  cancelorder,
  applycoupon
};

