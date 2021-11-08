const mongoose = require('mongoose');
const schema = mongoose.Schema

const campgroundSchema = new schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
    ,
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})


module.exports = mongoose.model('campgrounds', campgroundSchema)