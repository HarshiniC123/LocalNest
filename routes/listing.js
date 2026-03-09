const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {listingJoiSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const {validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')

const {storage} = require("../cloudConfig.js");
console.log("storage:",storage.constructor.name); // Check the type of storage
const upload = multer({ storage });
// const upload = multer({ dest: 'uploads/' })

router.use((req, res, next) => {
    console.log("ROUTER HIT:", req.method, req.originalUrl);
    next();
});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  // .post(isLoggedIn,validateListing, wrapAsync(listingController.create));
  // store the uploaded file under a simple field name to avoid bracket issues
  .post(upload.single('image'), isLoggedIn,
  validateListing,
  wrapAsync(listingController.create));

//new route
router.get("/new",isLoggedIn,(listingController.new));

router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete))
  // upload a single file under the "image" field; parse the body before validating
  .put(isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(listingController.update));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;
