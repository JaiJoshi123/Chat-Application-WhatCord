module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl  //to return to the original url user were on
        req.flash('error', 'Please login first!')
        return res.redirect('/');
    }
    next();
}