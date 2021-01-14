const mongoose = require("mongoose")
const moment = require("moment")

const chatSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now,
        required: true
    }
})

chatSchema.virtual('time').get(function() {
    return moment(this.date).format('h:mm a')
})


module.exports = mongoose.model("Chat",chatSchema);