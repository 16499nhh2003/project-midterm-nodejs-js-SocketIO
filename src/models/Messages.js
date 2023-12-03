const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        text: { type: String, require: true },
    },
    base64Image: {
        text: { type: String, require: true },
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        require: true,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            require: false
        }
    ]
}, { timestamps: true, });
module.exports = mongoose.model('Message', messageSchema)
