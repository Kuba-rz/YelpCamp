const express = require('express')
const router = express.Router()

const functions = require('../helpers/functionHelpers')
const catchAsync = functions.catchAsync
const User = require('../models/user')

router.get('/', (req, res) => {
    res.locals.title = 'Register'
    res.render('user/register')
})

router.post('/', catchAsync(async (req, res) => {
    const { email, username, password } = req.body
    const user = new User({ email, username })
    try {
        await User.register(user, password)
        req.flash('success', 'Welcome to YelpCamp')
        res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }


}))

module.exports = router