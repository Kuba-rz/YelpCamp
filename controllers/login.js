module.exports.renderLoginForm = (req, res) => {
    res.locals.title = 'Login'
    res.render('user/login')
}

module.exports.logIn = async (req, res) => {
    req.flash('success', 'Welcome back')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    req.session.returnTo = null
    res.redirect(redirectUrl)
}