const wishlistSchema=require('../model/wishlistSchema')
const Cart=require('../model/cartSchema')
const User=require('../model/User')
const Products=require('../model/Products')

const wishlist= async (req,res)=>{
    try{
      const userName = await User.findOne({ _id: req.session.user_id });
      const count = (await Cart.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      const wishlist= await wishlistSchema.findOne({userid:req.session.user_id}).populate({
        path: "products.productId",
        model: "Products",
        populate: { path: 'offer' }
      })
      .exec()
      const wishlistcount=(await wishlistSchema.findOne({ userid: req.session.user_id }))?.products?.length || 0;
      res.render('wishlist',{userName,count,wishlist,wishlistcount})
    }catch(err){
      console.log(err);
    }
  }

  const addtowishlist = async (req, res) => {
    try {
        const { productid } = req.body;
        const userid = req.session.user_id;
        let wishlist = await wishlistSchema.findOne({ userid: userid });

        if (!wishlist) {
            wishlist = new wishlistSchema({
                userid: userid,
                products: [{ productId: productid }]
            });
            await wishlist.save();
            const wishlistCount = wishlist.products.length;
            return res.json({ Success: "New wishlist is created with the product.", wishlistCount });
        }

        const productExists = wishlist.products.some(product => product.productId.equals(productid));

        if (!productExists) {
            wishlist.products.push({ productId: productid });
            await wishlist.save();
            const wishlistCount = wishlist.products.length;
            return res.json({ Success: "Product added to wishlist.", wishlistCount });
        } else {
            const wishlistCount = wishlist.products.length;
            return res.json({ already: "Product already exists in the wishlist.", wishlistCount });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};



  const removeWishlist = async (req, res) => {
    try {
      const { productid } = req.body;
      const userid=req.session.user_id
      const wishlist = await wishlistSchema.findOne({ userid: userid });


      if (!wishlist) {
        return res.status(404).json({ error: "Wishlist not found" });
      }


      const productIndex = wishlist.products.findIndex(product => product.productId.toString() === productid);


      if (productIndex === -1) {
        return res.status(404).json({ error: "Product not found in wishlist" });
      }

      wishlist.products.splice(productIndex, 1);
      await wishlist.save();


      res.json({ success: "Product removed from wishlist" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };



  module.exports={
    wishlist,
    addtowishlist,
    removeWishlist
  }