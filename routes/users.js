const express = require("express")
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const users = require("../controllers/auth")
const { isLoggedin } = require("../middleware")

//google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google',
    { failureRedirect: '/', failureFlash: true }),
    (req, res) => {
        req.flash('success', `Welcome Back ${req.user.displayName}`);
        res.redirect('/chat/index');
    });

router.get('/logout', users.logout)

module.exports = router;