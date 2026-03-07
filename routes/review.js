const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn, validateReview} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.index));

//delete review route
router.delete("/:reviewId",wrapAsync(reviewController.delete));

module.exports = router;