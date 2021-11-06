const joi = require('joi')
const expressError = require('./expressError')

function catchAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err))
    }
}

function validateCampground(req, res, next) {
    const { title, price, image, description, location } = req.body
    const campgroundSchema = joi.object({
        title: joi.string().required(),
        price: joi.number().min(0).required(),
        description: joi.string().required(),
        image: joi.string().required(),
        location: joi.string().required()
    })
    const { error } = campgroundSchema.validate({ title, price, description, image, location })
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports = {
    catchAsync,
    validateCampground
}