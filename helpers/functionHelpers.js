const joi = require('joi')
const expressError = require('./expressError')

const campground = require('../models/campground')
const Review = require('../models/review')

function catchAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err))
    }
}

async function isOwner(req, res, next) {
    const id = req.params.id || req.query.id
    console.log(id)
    const camp = await campground.findById(id)
    if (!camp.owner.equals(req.user._id)) {
        req.flash('error', 'Unauthorized access')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

async function isOwnerReview(req, res, next) {
    const reviewId = req.params.id
    const review = await Review.findById(reviewId)
    if (!review.owner.equals(req.user._id)) {
        req.flash('error', 'Unauthorized access')
        return res.redirect('/campgrounds')
    }
    next()
}

function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You need to log in first')
        req.session.returnTo = req.originalUrl
        return res.redirect('/login')
    }
    next()
}

function validateCampground(req, res, next) {
    const { title, price, image, description, location } = req.body
    const campgroundSchema = joi.object({
        title: joi.string().required(),
        price: joi.number().min(0).required(),
        description: joi.string().required(),
        //  image: joi.string().required(),
        location: joi.string().required()
    })
    const { error } = campgroundSchema.validate({ title, price, description, location })
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }
    else {
        next()
    }
}

function validateReview(req, res, next) {
    const { body, rating } = req.body
    const reviewSchema = joi.object({
        body: joi.string().required(),
        rating: joi.number().min(1).max(5).required(),
    })
    const { error } = reviewSchema.validate({ body, rating })
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports = {
    catchAsync,
    validateCampground,
    validateReview,
    isLoggedIn,
    isOwner,
    isOwnerReview
}