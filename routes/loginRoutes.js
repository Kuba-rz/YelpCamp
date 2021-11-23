const express = require('express')
const router = express.Router()
const passport = require('passport')

const functions = require('../helpers/functionHelpers')
const catchAsync = functions.catchAsync
const User = require('../models/user')

const loginController = require('../controllers/login')

router.get('/', loginController.renderLoginForm)

const authOptions = { failureFlash: true, failureRedirect: '/login' }

router.post('/', passport.authenticate('local', authOptions), catchAsync(loginController.logIn))

module.exports = router