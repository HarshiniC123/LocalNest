// authorization middleware to ensure the current user owns a specific listing
const Listing = require('./models/listing'); // assume relative path may need adjusting if moved

module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.path," ",req.originalUrl);
    if(!req.isAuthenticated()){
        //redirect url save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateListing = (req, res, next) => {

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