if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const sessionOptions ={
    secret :"mysecretkey",
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7,
        httpOnly : true
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //this is to initialize passport
app.use(passport.session()); //this is to use passport sessions
passport.use(new LocalStrategy(User.authenticate())); //this is to use the local strategy for authentication, and we are using the authenticate method provided by passport-local-mongoose

passport.serializeUser(User.serializeUser()); //serialize means to store the user in the session, we use this when the user logs in, and this is useful when we want to store the user in the session.
passport.deserializeUser(User.deserializeUser()); //this is to deserialize the user, and we are using the deserializeUser method provided by passport-local-mongoose

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user; //this is to make the current user available in all the templates, so that we can use it to show different options in the navbar based on whether the user is logged in or not.
    next();
});

app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews",reviewRoutes);
app.use("/",userRoutes);

const mongoose = require('mongoose');
const password = process.env.ATLASDB_PASSWORD;
const mongo_url = process.env.ATLASDB_URL.replace("password", process.env.ATLASDB_PASSWORD);
async function main(){
    mongoose.connect(mongo_url);
}

console.log(process.env.ATLASDB_URL);
console.log(process.env.ATLASDB_PASSWORD);
console.log(mongo_url);

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

// app.get("/fakeUser",async(req,res)=>{
//     const fakeuser = new User({email:"fakeuser@example.com",username:"fakeuser"});
//     const newUser = await User.register(fakeuser,"password"); //register automatically checks if the username is already taken, and if not, it hashes the password and saves the user to the database.
//     console.log(newUser);
//     res.send(newUser); 
// });

//Middlewares


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});
