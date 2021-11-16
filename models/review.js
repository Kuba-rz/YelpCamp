const mongoose = require('mongoose');
const schema = mongoose.Schema

const reviewSchema = new schema({
    body: {
        type: String,
        required: true
    },
    rating: Number,
    owner: {
        type: schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', reviewSchema)