// Shows the feed, a very basic feed setup that shows the items of the user

import express, { json } from 'express';
import ClosetItem from '../models/ClosetItems.js';

const router = express.Router();

// Handles GET requests
// retrieve the items, this is so the items can be shown on the feed 
// so long as the user allows it to be pulically shown
router.get('/', async (req, res) =>{
    // Query the items if they are listed as public, ensures the app shows only things the user
    // wants to be publicily shown. .populate is to show the users info that has posted
    const items = await ClosetItem.find( { isPublic : true}).populate('user', 'name email');

    return res.json({ items });

});
