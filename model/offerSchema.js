const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startingDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },

})

const offer = mongoose.model("offer", offerSchema)
module.exports = offer



