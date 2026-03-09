const Listing=require("../models/listing");
const Review = require("../models/review");
const { listingJoiSchema } = require("../schema");
const { geocodeLocation } = require("../utils/geocoding");
const ExpressError = require("../utils/ExpressError");


module.exports.index = (async (req,res)=>{
    const listings=await (Listing.find());

    res.render("../views/listings/index.ejs",{listings});
});

module.exports.new = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.show = async(req,res)=>{
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
};

module.exports.create = async (req, res) => {
  // parseListingBody middleware already ensures req.body.listing exists
  if (!req.body || !req.body.listing) {
    req.flash("error", "Invalid request data");
    return res.redirect('/listings/new');
  }
  
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;
  
  // Geocode the location
  const geoData = await geocodeLocation(listing.location);
  if (geoData.success) {
    listing.geometry = {
      type: "Point",
      coordinates: [geoData.longitude, geoData.latitude]
    };
  } else {
    req.flash("error", `Could not find location: ${geoData.error}`);
    return res.redirect('/listings/new');
  }
  
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }
  
  await listing.save();
  req.flash('success','Successfully created a new listing!');
  res.redirect('/listings');
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    let originalImgUrl = listing.image.url;
    originalImgUrl = originalImgUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImgUrl });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    // req.body.listing should already be built by parseListingBody
    if (!req.body || !req.body.listing) {
        req.flash("error", "Invalid request data");
        return res.redirect(`/listings/${id}`);
    }

    const updatedData = { ...req.body.listing };
    
    // Geocode the location if it was updated
    const geoData = await geocodeLocation(updatedData.location);
    if (geoData.success) {
        updatedData.geometry = {
            type: "Point",
            coordinates: [geoData.longitude, geoData.latitude]
        };
    } else {
        req.flash("error", `Could not find location: ${geoData.error}`);
        return res.redirect(`/listings/${id}/edit`);
    }
    
    if (req.file) {
      updatedData.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }
    
    const updatedListing = await Listing.findByIdAndUpdate(id,
        updatedData, { new: true, runValidators: true });
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${updatedListing._id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};