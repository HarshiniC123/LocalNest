const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose').default;

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});

// THIS must receive a function ✔
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
