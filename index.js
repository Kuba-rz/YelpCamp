if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const passportLocal = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const helmetConfig = require('./helpers/helmet')
const MongoStore = require('connect-mongo');

const expressError = require('./helpers/expressError')

const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const registerRoutes = require('./routes/registerRoutes')
const loginRoutes = require('./routes/loginRoutes')

const DBUrl = process.env.mongoAtlasURL || 'mongodb://localhost:27017/YelpCamp'

//Connect the app to mongoose
async function connectMongo() {
    try {
        await mongoose.connect(DBUrl);
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

const secret = process.env.SECRET || 'thisisnotagoodsecret'

const store = MongoStore.create({
    mongoUrl: DBUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
})

store.on('error', function (e) {
    console.log('SESSION ERROR', e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use(mongoSanitize())

app.use(helmet())
app.use(helmetConfig)


passport.use(new passportLocal(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log('Listening on port 3000')
})


app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    res.locals.currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl
    next()
})


app.get('/', (req, res) => {
    res.locals.title = 'Home'
    res.render('campgrounds/homepage')
})

app.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'Succesfully logged out')
    res.redirect('/campgrounds')
})



//The differnet routes which are specified in different files
app.use('/campgrounds', campgroundRoutes)

app.use('/campgrounds/:campid/review', reviewRoutes)

app.use('/register', registerRoutes)

app.use('/login', loginRoutes)


app.use((req, res, next) => {
    throw new expressError('Cannot find the specified webpage!', 404)
})

app.use((err, req, res, next) => {
    res.locals.title = 'Error'
    const { message = 'Something went wrong!', status = 500 } = err
    const stack = err.stack
    res.status(status).render('error', { message, status, stack })
})

