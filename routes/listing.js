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

//listings index route
router.get("/",wrapAsync(listingController.index));

//new route
router.get("/new",isLoggedIn,(listingController.new));

//show route
router.get("/:id",wrapAsync(listingController.show));

//create route
router.post(
  "/",
  validateListing,
  wrapAsync(listingController.create)
);

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.update)
);


//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.delete));

module.exports = router;
