const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const ejsMate = require('ejs-mate')

const expressError = require('./helpers/expressError')

const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRoutes')


//Connect the app to mongoose
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

app.use('/campgrounds', campgroundRoutes)

app.use('/campgrounds/:campid/review', reviewRoutes)

app.use((req, res, next) => {
    throw new expressError('Cannot find the specified webpage!', 404)
})

app.use((err, req, res, next) => {
    res.locals.title = 'Error'
    const { message = 'Something went wrong!', status = 500 } = err
    const stack = err.stack
    res.status(status).render('error', { message, status, stack })
})

