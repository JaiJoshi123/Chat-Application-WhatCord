const express = require("express")
const router = express.Router();
const User = require("../models/user")
const Room = require("../models/room");
const { isLoggedin } = require("../middleware")

router.get('/index', isLoggedin ,async(req, res) => {
    //console.log(req)
    const rooms = await Room.find({})
    res.render("chats/index",{ rooms })
})

router.post('/index', isLoggedin, async (req, res) => {
    if(req.body.roomname2!=undefined){
       return res.redirect(`/chat/${req.body.roomname2}`)
    }
    else{
        try {
            const currUser = await User.findById(req.user._id)
            const room = req.body.roomName;
            const newRoom = new Room({
                name: room,
                owner: currUser
            })
            await newRoom.save();
            res.redirect(`/chat/${newRoom._id}`)
        }catch(e){
            req.flash('error',e);
        }
    }
})

router.get('/:id',isLoggedin, async(req,res)=>{
    const { id} =req.params;
    const room = await Room.findById(id).populate('owner')
                .populate({path: 'messages'}).populate({path: 'users'}).sort({'messages.date': 1})
    res.render("chats/room", { room , user: req.user})
})

module.exports = router