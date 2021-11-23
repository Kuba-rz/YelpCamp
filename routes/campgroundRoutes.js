const express = require('express')
const router = express.Router()

const campground = require('../models/campground')
const functions = require('../helpers/functionHelpers')
const { date } = require('joi')

const catchAsync = functions.catchAsync
const validateCampground = functions.validateCampground
const isLoggedIn = functions.isLoggedIn
const isOwner = functions.isOwner


const campgroundController = require('../controllers/campground')

router.get('/', catchAsync(campgroundController.index))

router.get('/new', isLoggedIn, campgroundController.renderNewForm)

router.get('/edit', isLoggedIn, isOwner, catchAsync(campgroundController.renderEditForm))

router.get('/:id', catchAsync(campgroundController.renderOneCamp))

router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundController.createCampground))

router.put('/:id', isLoggedIn, isOwner, validateCampground, catchAsync(campgroundController.editCampground))

//Route to delete a specific campground
router.delete('/:id', isLoggedIn, isOwner, catchAsync(campgroundController.deleteCampground))

module.exports = router