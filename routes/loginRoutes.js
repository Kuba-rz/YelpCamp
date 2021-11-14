const express = require('express')
const router = express.Router()
const passport = require('passport')

const functions = require('../helpers/functionHelpers')
const catchAsync = functions.catchAsync
const User = require('../models/user')

router.get('/', (req, res) => {
    res.locals.title = 'Login'
    res.render('user/login')
})

const authOptions = { failureFlash: true, failureRedirect: '/login' }

router.post('/', passport.authenticate('local', authOptions), catchAsync(async (req, res) => {
    req.flash('success', 'Welcome back')
    res.redirect('/campgrounds')
}))

module.exports = router