// authorization middleware to ensure the current user owns a specific listing
const Listing = require('./models/listing'); // assume relative path may need adjusting if moved

// bring in joi validation schemas used by several middleware functions
const { listingJoiSchema, reviewJoiSchema } = require('./schema');

const ExpressError = require('./utils/ExpressError');

// helper to normalize flat body fields produced by multer when using
// bracketed names such as "listing[title]".  multer doesn't automatically
// nest these values, so we need to reconstruct the `listing` object before
// validation or controller logic.
module.exports.parseListingBody = (req, res, next) => {
    if (req.body && !req.body.listing) {
        const listingData = {};
        for (const key in req.body) {
            const match = key.match(/^listing\[(.+)\]$/);
            if (match) {
                listingData[match[1]] = req.body[key];
                // remove the flat field to avoid confusion later
                delete req.body[key];
            }
        }
        if (Object.keys(listingData).length > 0) {
            req.body.listing = listingData;
        }
    }
    next();
};

module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.path," ",req.originalUrl);
    if(!req.isAuthenticated()){
        // redirect url save
        let redirectTo = req.originalUrl;
        // if user was submitting a review form, take them back to listing page instead
        if (req.method === 'POST' && redirectTo.match(/^\/listings\/[^\/]+\/reviews/)) {
            redirectTo = redirectTo.replace(/\/reviews.*$/, '');
        }
        req.session.redirectUrl = redirectTo;
        req.flash("error","You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    // make sure the body is normalized before validating
    if (req.body) {
        module.exports.parseListingBody(req, res, () => {});
    }
    const { error } = listingJoiSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview = (req,res,next)=>{
    let {err} = reviewJoiSchema.validate(req.body);
    if(err) {
        let errMsg = err.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};



module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }
    if (!req.user || !listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }
    const review = listing.reviews.id(reviewId);
    if (!review) {
        req.flash('error', 'Cannot find that review!');
        return res.redirect(`/listings/${id}`);
    }
    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};