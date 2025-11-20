import express from 'express';
import ClosetItem from '../models/ClosetItems.js';
import User from '../models/Users.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const items = await ClosetItem.find({ user : req.userId});

        return res.json({message : "The items within your closet" , items})
    } catch (error) {
        return res.status(500).json({message : "Server Error"})
    }
});


// handles the POST requests 
// creating new data, or adding items within the app. This allows the user to create and add new items to their closet
router.post('/addItem', async (req, res) => {
    // Get the items from the model that was created for whats needed to make a closet item
    const {title, imageUrl, brand, notes, rating, isPublic} = req.body;

    // If the title is not inputted or does not exist then send an error
    if (!title) {
        return res.status(400).json( { message : "Title is not valid"})
    }

    const item = await ClosetItem.create({
        title,
        imageUrl,
        brand,
        notes,
        rating,
        isPublic,
        user : req.userId
    });

    return res.json( { message : "Item has been added to the closet", item : item})
});


// Handles PATCH requests 
// Updating anything within a resource
// In this case, this allows for modification to the rating and toggling public/private
router.patch('/rate', async (req, res) => {
    
    try {
        const {itemId, rating, isPublic} = req.body;

        if (!itemId) {
            return res.status(400).json({message : "Missing itemId"})
        }

        // Validate rating if provided
        if (rating !== undefined){
            const inRange = rating >= 1 && rating <= 5;
            if (!inRange){
                return res.status(400).json({message : "Rating must be between 1-5"})
            }
        }

        const updatedFields = {};
        if (rating !== undefined) updatedFields.rating = rating;
        if ( isPublic !== undefined) updatedFields.isPublic = isPublic;
        
        const updated = await ClosetItem.findOneAndUpdate(
            {_id : itemId, user : req.userId},
            { $set : updatedFields},
            { new : true}
        );

        if (!updated) {
            return res.status(404).json({ message : "Item not found or not authroized"});
        }

        return res.json({
            message : "Item updated successfully",
            updatedItem : updated
        });

    } catch (error) {
        return res.status(500).json({message : "Server Error"});
    }
});