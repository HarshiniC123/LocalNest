const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');
const { object } = require('joi');

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
    initdata.data = initdata.data.map((object)=>({...object, owner: "69abc0591418f34e4f6d279e"}));
    await Listing.insertMany(initdata.data);
    console.log("DB Initialized with data");
}

initDB();

