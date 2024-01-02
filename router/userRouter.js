const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
const middleware=require("../middleware/User")
const productsController=require('../controller/products')
const { route } = require("./adminRoute")
const cartController=require('../controller/cartController')
const Cart=require('../model/cartSchema')
const Product=require('../model/Products')

//user login signup otp
router.get('/',middleware.isBlock,userController.home)
router.get('/login',middleware.islogin,userController.login)
router.get('/signup',middleware.islogin,userController.signup)
router.post('/register',middleware.islogin,userController.register)
router.post('/loginsubmit',middleware.islogin,userController.submitlogin)
router.get('/otp',userController.loadOtp);
router.post('/otp',userController.verifyOtp);


router.get('/logout',userController.logout)


//products setting
router.get('/singleproduct/:id',productsController.singleProduct)
router.get('/allproducts',userController.allproducts)


///cart  handlng
router.get('/usercart',cartController.cart)
router.post('/addingcart/:productid/:userid/:quantity',cartController.addtocart)
router.get('/usercheckout',cartController.checkout)


// router.post('/updateQuantity', async (req, res) => {
//     try {
//         const { cartId, productId, quantity } = req.body;
//         const id = req.session.userid;
//         console.log("hellop");

//         const updatedCart = await Cart.findOneAndUpdate(
//             { _id: cartId, "products.productId": productId },
//             {
//                 $set: {
//                     "products.$.quantity": quantity,
//                     "products.$.totalPrice": quantity * updatedCart.products.find(p => p.productId.equals(productId)).productPrice
//                 }
//             },
//             { new: true }
//         );
//                 console.log(updatedCart);

//         res.json({ success: true, message: 'Quantity updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });





router.post('/updateQuantity', async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;
        const id = req.session.userid;

        const existingCart = await Cart.findById(cartId);

        if (!existingCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const productToUpdate = existingCart.products.find(p => p.productId.equals(productId));

        if (!productToUpdate) {
            return res.status(404).json({ success: false, message: 'Product not found in the cart' });
        }

        productToUpdate.quantity = quantity;
        productToUpdate.totalPrice = quantity * productToUpdate.productPrice;

        const updatedCart = await existingCart.save();
        const updatedTotalPrice = productToUpdate.totalPrice;

        res.json({ success: true, message: 'Quantity updated successfully', updatedTotalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/removeFromCart', async (req, res) => {
    try {
        const { cartId, productId } = req.body;
        const id = req.session.userid;

        const existingCart = await Cart.findById(cartId);

        if (!existingCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Remove the product from the cart
        existingCart.products = existingCart.products.filter(p => !p.productId.equals(productId));

        const updatedCart = await existingCart.save();

        res.json({ success: true, message: 'Product removed from the cart', updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports=router