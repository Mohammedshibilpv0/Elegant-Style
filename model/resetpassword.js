const mongoose = require('mongoose');


const resetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


resetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 });

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

module.exports = ResetToken;
