const campground = require('../models/campground')
const User = require('../models/user')
const { cloudinary } = require('../cloudinary/index')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoding = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })

module.exports.index = async (req, res) => {
    res.locals.title = 'Campgrounds'
    const foundCampgrounds = await campground.find({})
    res.render('campgrounds/campgrounds', { foundCampgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.locals.title = 'New'
    res.render('campgrounds/new')
}

module.exports.renderEditForm = async (req, res) => {
    const id = req.query.id
    const camp = await campground.findById(id)
    res.locals.title = 'Edit'
    res.render('campgrounds/edit', { camp })
}

module.exports.renderOneCamp = async (req, res) => {
    const id = req.params.id
    try {
        const camp = await campground.findById(id).populate('owner').populate({
            path: 'reviews',
            populate: {
                path: 'owner'
            }
        })
        res.locals.title = camp.title
        res.render('campgrounds/single campground', { camp })
    } catch {
        req.flash('error', 'Cannot find the specified campground')
        res.redirect('/campgrounds')
    }
}

module.exports.createCampground = async (req, res, next) => {
    const { title, price, description, location } = req.body
    const geolocation = await geocoding.forwardGeocode({
        query: location,
        limit: 1
    }).send()
    const owner = await User.findById(req.user._id)
    const newCamp = new campground({ title, price, description, location, owner })
    newCamp.geometry = geolocation.body.features[0].geometry
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await newCamp.save()
    res.locals.title = 'Add'
    req.flash('success', 'New campground has been succesfully added')
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.editCampground = async (req, res) => {
    const id = req.params.id
    const { title, price, description, location } = req.body
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    const camp = await campground.findByIdAndUpdate(id, { title, price, description, location })
    camp.images.push(...imgs)
    if (req.body.deleteImages && req.body.deleteImages.length > 0) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await camp.save()
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id
    await campground.findByIdAndDelete(id)
    req.flash('success', 'Campground has been succesfully deleted')
    res.redirect('/campgrounds')
}
