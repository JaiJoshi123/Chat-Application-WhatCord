module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Ok bye!');
    req.session.destroy()
    res.redirect('/');
}