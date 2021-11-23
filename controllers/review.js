const campground = require('../models/campground')
const User = require('../models/user')
const review = require('../models/review')

module.exports.addReview = async (req, res) => {
    const { body, rating } = req.body
    const camp = await campground.findById(req.params.campid)
    const owner = await User.findById(req.user._id)
    const rev = new review({ body, rating, owner })
    camp.reviews.push(rev)
    const result = await camp.save()
    await rev.save()
    req.flash('success', 'Review has been added')
    res.redirect(`/campgrounds/${camp.id}`)
}

module.exports.deleteReview = async (req, res) => {
    const reviewId = req.params.id
    await review.findByIdAndDelete(reviewId)
    const campId = req.params.campid
    const camp = await campground.findById(campId)
    const reviewIndex = camp.reviews.indexOf(reviewId)
    camp.reviews.splice(reviewIndex, 1)
    await camp.save()
    req.flash('success', 'Review has been deleted')
    res.redirect(`/campgrounds/${campId}`)
}