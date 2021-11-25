const mongoose = require('mongoose')
let cities = require('./cities')
const words = require('./seedWords')
const campground = require('../models/campground')
const User = require('../models/user')

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

async function seed() {
    await campground.remove({})

    for (let i = 0; i < 50; i++) {

        let descriptor = words[0][Math.floor(Math.random() * words[0].length)]
        let place = words[1][Math.floor(Math.random() * words[1].length)]
        let city = cities[i]
        let title = `${descriptor} ${place}`
        let image = { url: 'https://source.unsplash.com/collection/4139277', filename: 'UNKNOWN' }
        title = title[0].toUpperCase() + title.slice(1).toLowerCase()
        let description = 'Very beautiful and cosy place, for real adventurers. Definetely check this one out!'
        const owner = await User.findOne({ username: 'lol' })
        let newCampground = new campground({ title: title, price: 25, images: image, description: description, location: city.city, owner })
        await newCampground.save()

    }
}


seed().then(() => {
    mongoose.connection.close()
})
