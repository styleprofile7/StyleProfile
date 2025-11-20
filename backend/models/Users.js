// Model for User

import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    name : {
        type : String, // the data type for the field
        required : false, // boolean to determine if a field is required, in this case name is
        trim : true, // removes whitespaces from beginning and end of the string
        default : "" // Avoids undefined values by setting the name field to an empty string by default
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true, // converts the string to lowercase, for easier matching
        trim : true
    },
    passwordHash : {
        type : String,
        required : true,
        trim : true
    },
    points : {
        type : Number ,
        default : 0,
        min : 0
    },
    styleProfile : {
        archetype : String,
        colors : [String],
        brands : [String],
        rawAnswers : {type : Object}
    }
}, {timestamps : true});

const User = mongoose.model('User', userSchema);
export default User;
