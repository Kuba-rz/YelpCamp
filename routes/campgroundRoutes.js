const express = require('express')
const router = express.Router()

const campground = require('../models/campground')
const functions = require('../helpers/functionHelpers')
const { date } = require('joi')
const catchAsync = functions.catchAsync
const validateCampground = functions.validateCampground
const isLoggedIn = functions.isLoggedIn
const isOwner = functions.isOwner
const User = require('../models/user')

router.get('/', catchAsync(async (req, res) => {
    req.session.bla = 'hi'
    res.locals.title = 'Campgrounds'
    const foundCampgrounds = await campground.find({})
    res.render('campgrounds/campgrounds', { foundCampgrounds })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.locals.title = 'New'
    res.render('campgrounds/new')
})

router.get('/edit', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    const id = req.query.id
    const camp = await campground.findById(id)
    res.locals.title = 'Edit'
    res.render('campgrounds/edit', { camp })
}))

router.get('/:id', catchAsync(async (req, res) => {
    const id = req.params.id
    try {
        const camp = await campground.findById(id).populate('reviews').populate('owner')
        res.locals.title = camp.title
        res.render('campgrounds/single campground', { camp })
    } catch {
        req.flash('error', 'Cannot find the specified campground')
        res.redirect('/campgrounds')
    }
}))

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { title, price, image, description, location } = req.body
    const owner = await User.findById(req.user._id)
    const newCamp = new campground({ title, price, image, description, location, owner })
    await newCamp.save()
    res.locals.title = 'Add'
    req.flash('success', 'New campground has been succesfully added')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

router.put('/:id', isLoggedIn, isOwner, validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id
    const { title, price, description, location } = req.body
    await campground.findByIdAndUpdate(id, { title, price, description, location }, { runValidators: true })
    res.redirect(`/campgrounds/${id}`)
}))

//Route to delete a specific campground
router.delete('/:id', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    const id = req.params.id
    await campground.findByIdAndDelete(id)
    req.flash('success', 'Campground has been succesfully deleted')
    res.redirect('/campgrounds')
}))

module.exports = router