const express = require('express')
const router = express.Router({ mergeParams: true })

const review = require('../models/review')
const functions = require('../helpers/functionHelpers')
const campground = require('../models/campground')
const catchAsync = functions.catchAsync
const validateReview = functions.validateReview

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { body, rating } = req.body
    const camp = await campground.findById(req.params.campid)
    const rev = new review({ body, rating })
    console.log(req.params.campid)
    camp.reviews.push(rev)
    const result = await camp.save()
    await rev.save()
    req.flash('success', 'Review has been added')
    res.redirect(`/campgrounds/${camp.id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const reviewId = req.params.id
    await review.findByIdAndDelete(reviewId)
    const campId = req.params.campid
    const camp = await campground.findById(campId)
    const reviewIndex = camp.reviews.indexOf(reviewId)
    camp.reviews.splice(reviewIndex, 1)
    await camp.save()
    req.flash('success', 'Review has been deleted')
    res.redirect(`/campgrounds/${campId}`)
}))

module.exports = router