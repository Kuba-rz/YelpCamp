const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const campground = require('./models/campground')
const review = require('./models/review')
const ejsMate = require('ejs-mate')
const expressError = require('./helpers/expressError')
const functions = require('./helpers/functionHelpers')
const catchAsync = functions.catchAsync
const validateCampground = functions.validateCampground
const validateReview = functions.validateReview

async function connectMongo() {
    try {
        await mongoose.connect('mongodb://localhost:27017/YelpCamp');
        console.log('All good and connected')
    }
    catch (err) {
        console.log(`Error: ${err}`)
    }
}


connectMongo()


const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.engine('ejs', ejsMate)

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.listen(3000, () => {
    console.log('Listening on port 3000')
})


app.get('/', (req, res) => {
    res.locals.title = 'Home'
    res.render('campgrounds/homepage')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    res.locals.title = 'Campgrounds'
    const foundCampgrounds = await campground.find({})
    res.render('campgrounds/campgrounds', { foundCampgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.locals.title = 'New'
    res.render('campgrounds/new')
})

app.get('/campgrounds/edit', catchAsync(async (req, res) => {
    const id = req.query.id
    const camp = await campground.findById(id)
    res.locals.title = 'Edit'
    res.render('campgrounds/edit', { camp })
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id
    const camp = await campground.findById(id).populate('reviews')
    res.locals.title = camp.title
    res.render('campgrounds/single campground', { camp })
}))

app.post('/campgrounds/:id/review', validateReview, catchAsync(async (req, res) => {
    const { body, rating } = req.body
    const camp = await campground.findById(req.params.id)
    const rev = new review({ body, rating })
    camp.reviews.push(rev)
    const result = await camp.save()
    await rev.save()
    res.redirect(`/campgrounds/${camp.id}`)
}))

app.delete('/campgrounds/:campid/review/:id', catchAsync(async (req, res) => {
    const reviewId = req.params.id
    await review.findByIdAndDelete(reviewId)
    const campId = req.params.campid
    const camp = await campground.findById(campId)
    const reviewIndex = camp.reviews.indexOf(reviewId)
    camp.reviews.splice(reviewIndex, 1)
    await camp.save()

    res.redirect(`/campgrounds/${campId}`)
}))

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const { title, price, image, description, location } = req.body
    res.locals.title = 'Error'
    const newCamp = new campground({ title, price, image, description, location })
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id
    const { title, price, description, location } = req.body
    const camp = await campground.findByIdAndUpdate(id, { title, price, description, location }, { runValidators: true })
    res.redirect(`/campgrounds/${id}`)
}))

//Route to delete a specific campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id
    await campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.use((req, res, next) => {
    throw new expressError('Cannot find the specified webpage!', 404)
})

app.use((err, req, res, next) => {
    res.locals.title = 'Error'
    const { message = 'Something went wrong!', status = 500 } = err
    const stack = err.stack
    res.status(status).render('error', { message, status, stack })
})

