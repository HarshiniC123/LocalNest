const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {reviewJoiSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


const validateReview = (req,res,next)=>{
    let {err} = reviewJoiSchema.validate(req.body);
    if(err) {
        let errMsg = err.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

router.post("/",validateReview,wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is to remove the reference of review from listing
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;