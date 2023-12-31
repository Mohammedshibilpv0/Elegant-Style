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
            ref: 'Product',

        },
        name: {
            type: String,

        },
        price: {
            type: Number,

        },
        quantity: {
            type: Number,

        },
        total: {
            type: Number,

        },
        orderStatus: {
            type: String,
            default: 'placed',
            enum: ['placed', 'shipped', 'delivered', 'request return', 'returned', 'request cancellation', 'cancelled']
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