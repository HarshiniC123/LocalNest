
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.index = async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    const newReview = new Review(req.body.review);
    // attach current user as author
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.delete = async (req,res)=>{
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is to remove the reference of review from listing
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
};