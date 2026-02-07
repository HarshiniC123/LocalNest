
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
const listingRoutes = require("./routes/listing.js");

app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

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

app.listen(3000,()=>{
    console.log("server working on localhost 3000");
});

//index route
app.get("/",(req,res)=>{
    res.send("Hi I am root page");
});

//Middlewares

app.use("/listings",listingRoutes);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});