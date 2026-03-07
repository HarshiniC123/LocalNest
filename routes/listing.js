const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {listingJoiSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const {validateListing} = require("../middleware.js");

router.use((req, res, next) => {
    console.log("ROUTER HIT:", req.method, req.originalUrl);
    next();
});

//listings index route
router.get("/",wrapAsync(async (req,res)=>{
    const listings=await (Listing.find());

    res.render("../views/listings/index.ejs",{listings});
}));

//new route
router.get("/new",isLoggedIn,(req,res)=>{
    
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    // populate listing owner and each review's author so template can access author.username
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });
    // ensure every review has an author object for the template
    if (listing && listing.reviews) {
        listing.reviews.forEach(r => {
            if (!r.author) {
                r.author = { username: 'Anonymous' };
            }
        });
    }
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

//create route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  })
);


//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
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
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${updatedListing._id}`);
  })
);


//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;
