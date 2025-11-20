// Model for the Items within a users closet

import mongoose from "mongoose";
const { Schema } = mongoose;

const closetItemSchema = new Schema ({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    title : {
        type : String,
        required : true
    },
    imageUrl : {
        type : String
    },
    brand : {
        type : String
    },
    notes : {
        type : String
    },
    rating : {
        type : Number,
        min : 1, 
        max : 5
    },
    isPublic : {
        type : Boolean,
        default : false
    },

}, {timestamps : true});

const ClosetItem = mongoose.model("ClosetItem", closetItemSchema);
export default ClosetItem;