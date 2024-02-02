const mongoose=require('mongoose')

const cartSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true

            },
            quantity: {
                type: Number,
                default: 1
            },
            productPrice: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                default: 0
            },
            image:{
                type:String
            }

        },
    ]
})


const Cart= mongoose.model('cart',cartSchema)
module.exports=Cart