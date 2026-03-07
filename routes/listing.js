const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {listingJoiSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const {validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");

router.use((req, res, next) => {
    console.log("ROUTER HIT:", req.method, req.originalUrl);
    next();
});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,validateListing, wrapAsync(listingController.create));

//new route
router.get("/new",isLoggedIn,(listingController.new));

router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete))
  .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.update));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;
