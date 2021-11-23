const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
    res.locals.title = 'Register'
    res.render('user/register')
}

module.exports.register = async (req, res) => {
    const { email, username, password } = req.body
    const user = new User({ email, username })
    try {
        const regUser = await User.register(user, password)
        req.login(regUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to YelpCamp')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }


}