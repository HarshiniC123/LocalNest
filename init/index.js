const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

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

const initDB = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("DB Initialized with data");
}

initDB();

