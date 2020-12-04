const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    code:{
        type: Number,
        default: false,
        required: false,
    },
    verified:{
        type: Number,
        default: false,
        required: false,
    },
});

module.exports = mongoose.model('users', postSchema);