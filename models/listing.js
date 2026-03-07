const mongoose = require('mongoose');
const Review = require("./review");

const listingSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    description : {
       type: String
    },
    image : {
        filename:{
            type: String,
            default: "listingimage"
        },
        url : {
        type: String,
        default: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set : (v) => v === "" ? 
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        : v }
    },
    price : {
        type: Number,
        required:true,
    },
    location : {
        required:true,
        type: String
    },
    country : {
        type: String,
        required:true
    },
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});


//mongoose middleware to delete all reviews associated with a listing when the listing is deleted
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        if(listing.reviews.length){
        await Review.deleteMany({_id : {$in : listing.reviews}});
        }
    }
});

const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing;