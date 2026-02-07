const Joi = require("joi");

const listingJoiSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().allow("")
    })
  }).required()
});


const reviewJoiSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().min(1).max(5),
        comment : Joi.string().required()
    }).required()
})


module.exports = {listingJoiSchema,reviewJoiSchema};