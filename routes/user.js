const express = require('express');
const router = express.Router({mergeParams:true});
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    // forward any redirect query to template so the form can keep it
    const redirectUrl = req.query.redirect;
    res.render("users/login.ejs", { redirectUrl });
});

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local",{
        failureRedirect:"/login",
        failureFlash:true
    }),
    (req,res)=>{
        req.flash("success","Welcome back!");
        // prefer explicit redirect passed via form, then saved session url, fallback to listings
        let redirectUrl = req.body.redirect || res.locals.redirectUrl || "/listings";
        // clear any saved session redirect so it doesn't linger
        if (req.session.redirectUrl) {
            delete req.session.redirectUrl;
        }
        // decode any encoded characters (including anchors)
        try {
            redirectUrl = decodeURIComponent(redirectUrl);
        } catch (e) {
            // ignore malformed
        }
        res.redirect(redirectUrl);
});
router.get("/logout",(req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success","Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;