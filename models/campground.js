const mongoose = require('mongoose');
const review = require('./review')
const schema = mongoose.Schema

const imageSchema = new schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const campgroundSchema = new schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    images: [imageSchema],
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
    ],
    owner: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

campgroundSchema.post('findOneAndDelete', async camp => {
    if (camp.reviews.length) {
        await review.deleteMany({ _id: { $in: camp.reviews } })
    }
})


module.exports = mongoose.model('campgrounds', campgroundSchema)