const Product=require('../model/Products')
const Cart=require('../model/cartSchema')

const cart= async (req,res)=>{
    try{
        res.render('cart')
    }catch(err){
        console.log(err);
    }
}

const checkout= (req,res)=>{
    try{
        res.render('checkout')
    }catch(err){
        console.log(err);
    }
}

const addtocart= async (req,res)=>{
    try {
        const product_id = req.params.productid;
        const user_id = req.params.userid;
        const quantity = parseInt(req.params.quantity); // Convert quantity to an integer

        const producttocart = await Product.findOne({ _id: product_id });
        const cart = await Cart.findOne({ userid: user_id });

        if (producttocart && user_id) {
            if (cart) {
                // If cart exists, update or add a new item
                const existingProductIndex = cart.products.findIndex(item => item.productId.toString() === product_id);
                if (existingProductIndex !== -1) {
                    // Product already exists in the cart, update the quantity
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    // Add a new product to the cart
                    cart.products.push({
                        productId: product_id,
                        quantity: quantity,
                        productPrice: producttocart.OfferPrice,
                        totalPrice: quantity * producttocart.OfferPrice
                    });
                }

                await cart.save();
                console.log('Cart updated:', cart);
            } else {
                // If cart doesn't exist, create a new cart
                const newCart = new Cart({
                    userid: user_id,
                    products: [{
                        productId: product_id,
                        quantity: quantity,
                        productPrice: producttocart.OfferPrice,
                        totalPrice: quantity * producttocart.OfferPrice
                    }]
                });

                await newCart.save();
                console.log('New cart created:', newCart);
            }

            res.status(200).json({ message: 'Product added to cart successfully.' });
        } else {
            res.status(400).json({ error: 'Invalid product or user.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
}









module.exports= {
    cart,
    checkout,
    addtocart
}