const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {listingJoiSchema} = require("../schema.js");
const {reviewJoiSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

const validateListing = (req,res,next)=>{
    const {err}=listingJoiSchema.validate(req.body);
    if(err){
        let errMsg = err.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
}

const validateReview = (req,res,next)=>{
    let {err} = reviewJoiSchema.validate(req.body);
    if(err) {
        let errMsg = err.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//listings index route
router.get("/",wrapAsync(async (req,res)=>{
    const listings=await (Listing.find());

    res.render("/index.ejs",{listings});
}));

//new route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//create route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {

    const newListing = new Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
  })
);


//edit route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      {
        runValidators: true,
        new: true
      }
    );

    res.redirect(`/listings/${updatedListing._id}`);
  })
);


//delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
    
}));

//create review route
router.post("/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
router.delete("/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is to remove the reference of review from listing
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
