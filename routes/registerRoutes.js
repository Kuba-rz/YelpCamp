const express = require('express')
const router = express.Router()

const functions = require('../helpers/functionHelpers')
const catchAsync = functions.catchAsync
const User = require('../models/user')

const registerController = require('../controllers/register')

router.get('/', registerController.renderRegisterForm)

router.post('/', catchAsync(registerController.register))

module.exports = router