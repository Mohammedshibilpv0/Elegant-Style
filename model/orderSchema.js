const mongoose = require('mongoose');

const ordersSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Products: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',

        },
        name: {
            type: String,

        },
        price: {
            type: Number,

        },
        Status: {
            type: String,
            default: 'placed',
            enum: ['placed', 'shipped', 'delivered', 'request return', 'returned', 'request cancellation', 'cancelled']
        },
        quantity: {
            type: Number,

        },
        total: {
            type: Number,

        },
       
        reason:{
            type: String
        },
        image:{
            type:String
        }
    }],
   
    paymentMode: {
        type: String,


    },
    paymentStatus:{
        type:String,
        default:"pending"
    },
    total: {
        type: Number
    },
    date: {
        type: Date
    },
    address: {
        type: Object
    },

});

module.exports = mongoose.model('orders', ordersSchema);