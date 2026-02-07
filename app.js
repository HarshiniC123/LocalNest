{
const express = require('express');
const app = express();
const Listing = require("./models/listing.js");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require("./utils/ExpressError.js");
const {listingJoiSchema} = require("./schema.js");
const {reviewJoiSchema} = require("./schema.js");
const Review = require("./models/review.js");

app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
}  // basic required setup for express app

{
const mongoose = require('mongoose');
const mongo_url="mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    mongoose.connect(mongo_url);
}
main()
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log("Failed to connect to db",err);
    });

} // basic required setup for mongoose and connection to database 

app.listen(3000,()=>{
    console.log("server working on localhost 3000");
});

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

//index route
app.get("/",(req,res)=>{
    res.send("Hi I am root page");
});

//listings index route
app.get("/listings",wrapAsync(async (req,res)=>{
    const listings=await (Listing.find());

    res.render("listings/index.ejs",{listings});
}));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//create route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {

    const newListing = new Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
  })
);


//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put(
  "/listings/:id",
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
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
    
}));

//create review route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is to remove the reference of review from listing
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));



//Middlewares

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});