const { generate } = require("otp-generator");
const Product = require("../model/Products");
const User = require("../model/User");
const Cart = require("../model/cartSchema");
const Order= require('../model/orderSchema')
const Razorpay = require('razorpay');
const { response } = require("express");


const instance = new Razorpay({
  key_id: "rzp_test_QmkTPpR7YwgsmH",
  key_secret:"XEwHXRnbP4kAiT17e5nWBbLk",
});


const generateRazorpay=(orderid,adjustedAmount)=>{

 return new Promise((resolve,reject)=>{


  const options = {
    amount: adjustedAmount,
    currency: "INR",
    receipt: ""+orderid
  };
  instance.orders.create(options, function(err, order) {
    if(err){
      console.log(err);
    }

    resolve(order)
  });
 })
}


const cart = async (req, res) => {
  try {
    const user = req.session.user_id;
    const cartData = await Cart.findOne({ userid: user }).populate({
      path: "products.productId",
      model: "Products", // Make sure it matches the model name for the Product
    });
  
    if (cartData) {
      const totalPriceTotal = cartData.products.reduce((total, product) => {
        return total + product.totalPrice;
      }, 0);

      res.render("cart", { cartData, totalPriceTotal });
    }else{

        res.render("cart", {cartData});
    }
  } catch (err) {
    console.log(err);
  }
};

const checkout = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await User.findOne({ _id: userid });
    const cartData = await Cart.findOne({ userid: userid }).populate({
      path: "products.productId",
      model: "Products", // Make sure it matches the model name for the Product
    });
    const totalPriceTotal = cartData.products.reduce((total, product) => {
      return total + product.totalPrice;
    }, 0);

    res.render("checkout", { userid, user, cartData, totalPriceTotal });
  } catch (err) {
    console.log(err);
  }
};

const addtocart = async (req, res) => {
  try {
    const product_id = req.params.productid;
    const user_id = req.params.userid;
    const quantity = parseInt(req.params.quantity); // Convert quantity to an integer

    const producttocart = await Product.findOne({ _id: product_id });
    const cart = await Cart.findOne({ userid: user_id });

    if (producttocart && user_id) {
      if (cart) {
        // If cart exists, update or add a new item
        const existingProductIndex = cart.products.findIndex(
          (item) => item.productId.toString() === product_id
        );

        if (existingProductIndex !== -1) {
          // Product already exists in the cart, update the quantity and total price
          const existingProduct = cart.products[existingProductIndex];
          existingProduct.quantity += quantity;
          existingProduct.totalPrice =
            existingProduct.quantity * existingProduct.productPrice;
        } else {
          // Add a new product to the cart
          cart.products.push({
            productId: product_id,
            quantity: quantity,
            productPrice: producttocart.OfferPrice,
            totalPrice: quantity * producttocart.OfferPrice,
            image:producttocart.Images[0]
          });
        }

        await cart.save();
        console.log("Cart updated:", cart);
      } else {
        // If cart doesn't exist, create a new cart
        const newCart = new Cart({
          userid: user_id,
          products: [
            {
              productId: product_id,
              quantity: quantity,
              productPrice: producttocart.OfferPrice,
              totalPrice: quantity * producttocart.OfferPrice,
              image:producttocart.Images[0]
            },
          ],
        });

        await newCart.save();
        console.log("New cart created:", newCart);
      }
      const updatedCart = await Cart.findOne({ userid: user_id });
      const newCartCount = updatedCart ? updatedCart.products.length : 0;

      res.status(200).json({ message: "Product added to cart successfully.",newCartCount });
    } else {
      res.status(400).json({ error: "Invalid product or user." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const removecart = async (req, res) => {
  try {
    const { cartId, productId } = req.body;
    const id = req.session.userid;

    const existingCart = await Cart.findById(cartId);

    if (!existingCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Remove the product from the cart
    existingCart.products = existingCart.products.filter(
      (p) => !p.productId.equals(productId)
    );

    const updatedCart = await existingCart.save();

    res.json({
      success: true,
      message: "Product removed from the cart",
      updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const cartquantity = async (req, res) => {
  try {
    const { cartId, productId, quantity } = req.body;
    const id = req.session.userid;

    const existingCart = await Cart.findById(cartId);

    if (!existingCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const productToUpdate = existingCart.products.find((p) =>
      p.productId.equals(productId)
    );

    if (!productToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in the cart" });
    }

    productToUpdate.quantity = quantity;
    productToUpdate.totalPrice = quantity * productToUpdate.productPrice;

    const updatedCart = await existingCart.save();
    const updatedTotalPrice = productToUpdate.totalPrice;
    const totalPriceTotal = existingCart.products.reduce((total, product) => {
      return total + product.totalPrice;
    }, 0);
    console.log(totalPriceTotal);

    res.json({
      success: true,
      message: "Quantity updated successfully",
      updatedTotalPrice,
      totalPriceTotal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addAddress = async (req, res) => {
  try {
    const { location, Address, city, zip, phone, email, state } = req.body;
    console.log(Address);
    const userid = req.session.user_id;

    const user = await User.findById({ _id: userid });
    user.Addresses.push({
      location,
      address: req.body.Address,
      city,
      zip,
      phone,
      email,
      state:state
    });
    const updatedUser = await user.save();
    res.redirect("/usercheckout");
  } catch (err) {
    console.log(err);
  }
};


const  placecorder=async (req,res)=>{
  try {
    const paymentmethod=req.body.paymentMethod
    const selectedValue = req.body.selectedValue;
    const cartId = req.session.user_id; // Replace with the actual cart ID
    const cart = await Cart.findOne({ userid: cartId });


    // Fetch product details for each product in the cart
    const products = await Promise.all(cart.products.map(async (cartProduct) => {
        const productDetails = await Product.findById(cartProduct.productId);
        return {
            productId: cartProduct.productId,
            name: productDetails.Name,
            price: productDetails.Price,
            quantity: cartProduct.quantity,
            total: cartProduct.totalPrice,
            orderStatus: cartProduct.status,
            image:cartProduct.image,
            reason: cartProduct.cancellationReason,
        };
    }));

    // You can now use the 'products' array containing the product details
    const orderData = {
        user: req.session.user_id,
        Products: products,
        paymentMode: paymentmethod,
        total: products.reduce((acc, product) => acc + product.total, 0),
        date: new Date(),
        address: selectedValue,
    };
  
    // Create an instance of the Orders model
    const orderInstance = new Order(orderData);
   
   
      if(paymentmethod==="Cash on delivery"){
        const savedOrder = await orderInstance.save().then(async()=>{
          await Cart.deleteOne({userid:req.session.user_id})
      })
       res.json({ success: true, products: products });
      }else if(paymentmethod==="Razorpay"){
        const totalpriceInPaise = Math.round(orderData.total * 100); // Convert rupees to paise
        const minimumAmount = 100;
        const adjustedAmount = Math.max(totalpriceInPaise, minimumAmount);
        
       generateRazorpay(orderInstance._id,adjustedAmount).then(async(response)=>{
        
        const savedOrder = await orderInstance.save()
        res.json({ Razorpay: response, products: products });
       })
      
      }
} catch (error) {
    console.error('Error:', error);
    // Respond with an error message
    res.status(500).json({ success: false, message: 'An error occurred while processing the order or updating product stock.' });
}

}

const verfypayment= async (req,res)=>{
      try{
        const userid= req.session.user_id
        const {payment,order}=req.body
        const crypto=require('crypto')
        const orderid= order.receipt
      
        console.log(order);
        console.log(orderid);
        let hmac= crypto.createHmac('sha256','XEwHXRnbP4kAiT17e5nWBbLk')
        hmac.update(payment.razorpay_order_id+'|'+payment.razorpay_payment_id)
        hmac=hmac.digest('hex')
        if(hmac===payment.razorpay_signature){
           const order = await Order.findById(orderid)
          order.paymentStatus="Razorpay"
          await order.save();
          const cart= await Cart.deleteOne({userid:userid})
          res.json({payment:true})
        }
       
      }catch(err){
      console.log(err);
    }
}

const profileaddAddress = async (req, res) => {
  try {
    const { location, Address, city, zip, phone, email, state } = req.body;
    console.log(state);
    const userid = req.session.user_id;

    const user = await User.findById({ _id: userid });
    user.Addresses.push({
      location,
      address: req.body.Address,
      city,
      zip,
      phone,
      email,
      state:state
    });
    const updatedUser = await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
  }
};


module.exports = {
  cart,
  checkout,
  addtocart,
  addAddress,
  removecart,
  cartquantity,
  placecorder,
  verfypayment,
  profileaddAddress
};
