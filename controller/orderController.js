const Products = require("../model/Products");
const Orders = require("../model/orderSchema");
const Coupon=require('../model/couponSchema')
const Cart=require('../model/cartSchema');
const { ConnectionStates } = require("mongoose");
const User = require("../model/User");
const easyinvoice = require('easyinvoice');
const wishlistSchema=require('../model/wishlistSchema')

const cancelorder = async (req, res) => {
  const { orderId, productId, orgproId } = req.params;

  try {
    const user = await User.findOne({ _id: req.session.user_id });
    
    // Find the order
    const order = await Orders.findOne({ _id: orderId });

    // Find the canceled product within the order
    const canceledProduct = order.Products.find(product => product._id.toString() === productId);

    // Update the order status for the canceled product to "cancelled"
    const updatedOrder = await Orders.updateOne(
      { _id: orderId, 'Products._id': productId },
      { $set: { 'Products.$.Status': 'cancelled' } }
    );

    // Update the quantity of the canceled product back to the inventory
    const product = await Products.findById(orgproId);
    product.Quantity += canceledProduct.quantity;
    await product.save();

    // Calculate the refund amount for the canceled product
    const refundAmount = canceledProduct.total;

    // Update user's wallet with the refund amount
    if (order.paymentMode === 'Razorpay' || order.paymentMode === 'wallet') {
      user.wallet += refundAmount;
      const transaction = {
        amount: refundAmount,
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
    console.error('Error cancelling product:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


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
    const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
    const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const userName = await User.findOne({ _id: req.session.user_id });
    const orders = await Orders.find({ _id:orderid})
    .populate({
        path: 'Products.products',
        model: 'Products'
    })
    .exec();

    res.render("orderdetail",{orders,userName,count,orderid,wishlistcount})

  }catch(err){
    console.log(err);
  }
}


const invoiceDownload= async (req,res)=>{
  try {
    const orderId = req.params.id;
    const ordercheck = await Orders.findOne({ _id: orderId });

    if (!Orders) {
        return res.status(404).send('Order not found');
    }

    const products = ordercheck.Products.map(product => ({
        quantity: product.quantity,
        description: product.name,
        price: product.total,
        total: product.total
    }));
    console.log(products);
    const data = {
        "currency": "USD",
        "marginTop": 25,
        "marginRight": 25,
        "marginLeft": 25,
        "marginBottom": 25,
        "logo": "https://www.easyinvoice.cloud/img/logo.png",
        "sender": {
            "company": "ELEGANT-STYLE"

        },
        "client": {
            "company":ordercheck.address
        },
        "invoiceNumber": `INV-${orderId}`, // You can customize the invoice number
        "invoiceDate": new Date(Orders.date).toLocaleDateString('en-US'),
        "products": products,
        "bottomNotice": "Kindly pay your invoice within 15 days."
    };

    const result = await easyinvoice.createInvoice(data);

    if (!result.pdf || !result.pdf.length) {
        throw new Error('Failed to generate PDF document.');
    }

    const fileName = `invoice-${orderId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Length', result.pdf.length);
    res.send(Buffer.from(result.pdf, 'base64'));
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
}


module.exports = {
  cancelorder,
  applycoupon,
  vieworder,
  returnRequest,
  invoiceDownload
};

