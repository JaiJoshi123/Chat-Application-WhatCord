const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat_User'
    },
    messages:  [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat'
        }
    ],
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chat_User'
        }
    ]
})

module.exports = mongoose.model("Room",roomSchema);