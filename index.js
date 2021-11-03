const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const campground = require('./models/campground')
const ejsMate = require('ejs-mate')


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

app.get('/campgrounds', async (req, res) => {
    res.locals.title = 'Campgrounds'
    const foundCampgrounds = await campground.find({})
    res.render('campgrounds/campgrounds', { foundCampgrounds })
})

app.get('/campgrounds/new', (req, res) => {
    res.locals.title = 'New'
    res.render('campgrounds/new')
})

app.get('/campgrounds/edit', async (req, res) => {
    const id = req.query.id
    const camp = await campground.findById(id)
    res.locals.title = 'Edit'
    res.render('campgrounds/edit', { camp })
})

app.get('/campgrounds/:id', async (req, res) => {
    const id = req.params.id
    const camp = await campground.findById(id)
    res.locals.title = camp.title
    res.render('campgrounds/single campground', { camp })
})

app.post('/campgrounds', async (req, res) => {
    const { title, price, image, description, location } = req.body
    const newCamp = new campground({ title, price, image, description, location })
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp._id}`)
})

app.put('/campgrounds/:id', async (req, res) => {
    const id = req.params.id
    const { title, price, description, location } = req.body
    const camp = await campground.findByIdAndUpdate(id, { title, price, description, location }, { runValidators: true })
    res.redirect(`/campgrounds/${id}`)
})

//Route to delete a specific campground
app.delete('/campgrounds/:id', async (req, res) => {
    const id = req.params.id
    await campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

