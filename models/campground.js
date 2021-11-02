const mongoose = require('mongoose');
const schema = mongoose.Schema

const campgroundSchema = new schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        //required: true
    },
    image: String,
    description: String,
    location: String
})


module.exports = mongoose.model('campgrounds', campgroundSchema)