const express = require('express')
const router = express.Router({ mergeParams: true })

const review = require('../models/review')
const campground = require('../models/campground')
const functions = require('../helpers/functionHelpers')

const catchAsync = functions.catchAsync
const validateReview = functions.validateReview
const isLoggedIn = functions.isLoggedIn
const isOwner = functions.isOwnerReview

const reviewController = require('../controllers/review')


router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.addReview))

router.delete('/:id', isLoggedIn, isOwner, catchAsync(reviewController.deleteReview))

module.exports = router